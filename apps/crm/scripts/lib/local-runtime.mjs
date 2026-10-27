import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';

export const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const runtime=path.resolve(process.env.CRM_RUNTIME_DIR || (process.platform==='win32' && fs.existsSync('D:/') ? 'D:/CRM-local' : path.join(os.tmpdir(),'bizpulse-crm')));
export function loadLocalEnvironment(){
  const require=createRequire(import.meta.url);
  const requireNext=createRequire(require.resolve('next/package.json'));
  requireNext('@next/env').loadEnvConfig(project,true,{info(){},error(){}});
  fs.mkdirSync(path.join(runtime,'temp'),{recursive:true});
  process.env.TEMP=path.join(runtime,'temp');process.env.TMP=process.env.TEMP;
  process.env.NEXT_TELEMETRY_DISABLED='1';
}
export function loopbackUrl(value){
  try{return ['localhost','127.0.0.1','::1'].includes(new URL(value).hostname.replace(/^\[|\]$/g,''));}catch{return false;}
}
export function prepareCache(name){
  const destination=path.join(runtime,name==='preview'?'next-preview':'next-cache');
  const link=path.join(project,name==='preview'?'.next-preview':'.next');
  fs.mkdirSync(destination,{recursive:true});
  if(!fs.existsSync(link))fs.symlinkSync(destination,link,process.platform==='win32'?'junction':'dir');
  if(fs.realpathSync(link)!==fs.realpathSync(destination))throw Error('Existing Next cache points elsewhere; set CRM_RUNTIME_DIR to its parent before starting.');
  // Next's bundled files resolve dependencies relative to the physical D-drive cache.
  const dependencyLink=path.join(runtime,'node_modules');
  if(!fs.existsSync(dependencyLink))fs.symlinkSync(path.join(project,'node_modules'),dependencyLink,process.platform==='win32'?'junction':'dir');
  const normalized=value=>process.platform==='win32'?value.toLowerCase():value;
  if(normalized(fs.realpathSync(dependencyLink))!==normalized(fs.realpathSync(path.join(project,'node_modules'))))throw Error('Runtime dependencies belong to a different checkout. Choose a separate CRM_RUNTIME_DIR.');
  return link;
}
export function runNode(args,options={}){
  return new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,args,{cwd:project,env:{...process.env,...options.env},stdio:'inherit',windowsHide:true});
    const stop=()=>child.kill('SIGTERM');
    process.once('SIGINT',stop);process.once('SIGTERM',stop);
    child.once('error',reject);child.once('exit',code=>{process.removeListener('SIGINT',stop);process.removeListener('SIGTERM',stop);resolve(code??1);});
  });
}
export const nextBin=path.join(project,'node_modules/next/dist/bin/next');
export function sourceFingerprint(){
  const hash=crypto.createHash('sha256');
  const skip=new Set(['node_modules','tests','docs','examples','supabase','.git','.codex','.agents','.claude','dist','out']);
  function walk(directory){
    for(const entry of fs.readdirSync(directory,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
      if(entry.name.startsWith('.next')||entry.name.startsWith('.env')||entry.name==='next-env.d.ts'||entry.name.endsWith('.tsbuildinfo')||skip.has(entry.name))continue;
      const absolute=path.join(directory,entry.name);
      if(entry.isDirectory())walk(absolute);
      else if(entry.isFile() && (/\.(tsx?|jsx?|json|css|[cm]js|ya?ml|patch)$/.test(entry.name)||path.relative(project,absolute).startsWith('public'+path.sep)) && !/\.test\./.test(entry.name))hash.update(path.relative(project,absolute)).update(fs.readFileSync(absolute));
    }
  }
  walk(project);
  hash.update(process.env.NEXT_PUBLIC_SUPABASE_URL??'').update(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY??'');
  return hash.digest('hex');
}
export function requestedPort(args=process.argv.slice(2)){
  const index=args.indexOf('--port');const raw=args.find(arg=>arg.startsWith('--port='))?.slice(7)??(index>=0?args[index+1]:(process.env.PORT||'3000'));
  if(!/^\d+$/.test(raw??'')||Number(raw)<1024||Number(raw)>65535)throw Error('Port must be between 1024 and 65535.');
  return Number(raw);
}
