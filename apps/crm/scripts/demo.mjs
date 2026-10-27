import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import crypto from 'node:crypto';
import {loadLocalEnvironment,loopbackUrl,nextBin,prepareCache,project,requestedPort,runNode,runtime,sourceFingerprint} from './lib/local-runtime.mjs';
import {acquirePreviewLock,createPreviewTsconfig,inspectPreviewBuild,isPreviewDistDir} from './lib/preview-artifacts.mjs';

async function unusedPort(preferred){
  for(let port=preferred;port<Math.min(preferred+6,65536);port++){
    const available=await new Promise(resolve=>{const server=net.createServer();server.once('error',()=>resolve(false));server.listen(port,'127.0.0.1',()=>server.close(()=>resolve(true)));});
    if(available)return port;
  }
  throw Error('No free local port. Close an old preview and retry.');
}
async function main(){
  loadLocalEnvironment();
  if(!loopbackUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)||!loopbackUrl(process.env.NEXT_PUBLIC_APP_URL))throw Error('Demo requires local Supabase and APP URLs in .env.local.');
  if(!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||!process.env.SUPABASE_SERVICE_ROLE_KEY)throw Error('Local Supabase credentials are missing. Complete the local installation first.');
  process.env.CRM_LOCAL_PREVIEW='1';process.env.CRM_DEMO_MODE='true';process.env.SENTRY_DSN='off';
  prepareCache('preview');
  const marker=path.join(runtime,'demo-build.json');
  const fingerprint=sourceFingerprint();
  let saved;try{saved=JSON.parse(fs.readFileSync(marker,'utf8'));}catch{}
  let distDir=isPreviewDistDir(saved?.distDir)?saved.distDir:undefined;
  const fresh=saved?.fingerprint===fingerprint && distDir && inspectPreviewBuild(path.join(project,distDir),saved.buildId).ready;
  if(process.argv.includes('--check')){
    console.info(JSON.stringify({localConfiguration:true,buildReady:fresh,runtimeDirectory:runtime,modelCalls:0,externalMessages:0},null,2));return;
  }
  const release=acquirePreviewLock(runtime);
  try{
  const seeded=await runNode([path.join(project,'node_modules/tsx/dist/cli.mjs'),'--env-file=.env.local','scripts/seed-demo.ts'],{env:{NODE_ENV:'development',NODE_OPTIONS:'--max-old-space-size=2048'}});
  if(seeded!==0)throw Error('Real CRM preparation failed. Check local Supabase; use demo:offline separately if you want the optional sandbox.');
  if(!fresh){
    console.info('Preparing compiled demo routes. First build can take several minutes; later starts reuse the build.');
    distDir=`.next-preview/releases/build-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    // Next adds generation-specific type paths to its tsconfig. Give it a
    // generated configuration so rebuilding never edits the source tsconfig.
    const tsconfigPath=`.next-preview/configs/${path.posix.basename(distDir)}.json`;
    const original=JSON.parse(fs.readFileSync(path.join(project,'tsconfig.json'),'utf8'));
    const generated=createPreviewTsconfig(project,tsconfigPath,original);
    fs.mkdirSync(path.dirname(path.join(project,tsconfigPath)),{recursive:true});
    fs.writeFileSync(path.join(project,tsconfigPath),JSON.stringify(generated,null,2));
    const code=await runNode([nextBin,'build','--webpack'],{env:{CRM_PREVIEW_DIST_DIR:distDir,CRM_PREVIEW_TSCONFIG:tsconfigPath,NODE_ENV:'production',NODE_OPTIONS:'--max-old-space-size=6144'}});
    if(code!==0)throw Error('Demo build failed. Review the build output and retry.');
    if(sourceFingerprint()!==fingerprint)throw Error('Source changed during build. Run pnpm demo again to build a consistent version.');
    const inspected=inspectPreviewBuild(path.join(project,distDir));
    if(!inspected.ready)throw Error(`Preview build is incomplete: ${inspected.missing.join(', ')}`);
    const temporary=marker+'.'+process.pid+'.tmp';
    fs.writeFileSync(temporary,JSON.stringify({fingerprint,distDir,buildId:inspected.buildId,builtAt:new Date().toISOString()},null,2));
    fs.renameSync(temporary,marker);
  }
  const port=await unusedPort(requestedPort());
  console.info(`Offline workbench: http://localhost:${port}/demo/offline`);
  console.info(`Seeded CRM workspace: http://localhost:${port}/demo/enter?next=/app`);
  console.info('Fictional data. Deterministic local demonstration. No paid model calls or external messages. Keep this terminal open.');
  process.exitCode=await runNode([nextBin,'start','--hostname','127.0.0.1','--port',String(port)],{env:{CRM_PREVIEW_DIST_DIR:distDir,NODE_ENV:'production',NODE_OPTIONS:'--max-old-space-size=2048'}});
  }finally{release();}
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
