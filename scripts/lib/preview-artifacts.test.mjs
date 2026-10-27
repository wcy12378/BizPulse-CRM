import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
import {inspectPreviewBuild,isPreviewDistDir,acquirePreviewLock,createPreviewTsconfig} from './preview-artifacts.mjs';

const fixtures=path.join(process.env.CRM_RUNTIME_DIR||(process.platform==='win32'&&fs.existsSync('D:/')?'D:/CRM-local':os.tmpdir()),'verification/preview-artifacts');
function fixture(){
  const dir=path.join(fixtures,`${Date.now()}-${Math.random().toString(16).slice(2)}`);
  fs.mkdirSync(path.join(dir,'server/app/app'),{recursive:true});
  for(const file of ['routes-manifest.json','build-manifest.json','prerender-manifest.json','required-server-files.json'])fs.writeFileSync(path.join(dir,file),'{}');
  fs.writeFileSync(path.join(dir,'BUILD_ID'),'test-build');
  fs.writeFileSync(path.join(dir,'server/app-paths-manifest.json'),JSON.stringify({'/app/page':'app/app/page.js'}));
  fs.writeFileSync(path.join(dir,'server/app/app/page.js'),'');
  fs.writeFileSync(path.join(dir,'server/app/app/page_client-reference-manifest.js'),'');
  return dir;
}
test('BUILD_ID alone cannot mark an interrupted build ready',()=>{
  const dir=fixture();fs.unlinkSync(path.join(dir,'server/app/app/page_client-reference-manifest.js'));
  assert.equal(inspectPreviewBuild(dir,'test-build').ready,false);
});
test('a complete generation is ready and has the expected build ID',()=>{
  const dir=fixture();assert.equal(inspectPreviewBuild(dir,'test-build').ready,true);
  assert.equal(inspectPreviewBuild(dir,'other-build').ready,false);
});
test('only isolated generation paths can be reused',()=>{
  assert.equal(isPreviewDistDir('.next-preview/releases/build-abc123'),true);
  for(const dir of ['.next-preview','.next-preview/releases/../live','D:/private','.next-preview/releases/x/y'])assert.equal(isPreviewDistDir(dir),false);
});
test('a second launcher cannot build over a running preview',()=>{
  const dir=fixture();const release=acquirePreviewLock(dir);
  assert.throws(()=>acquirePreviewLock(dir),/already running/);
  release();const second=acquirePreviewLock(dir);second();
});
test('relocated preview config resolves source aliases without deprecated baseUrl',()=>{
  const ts=createRequire(new URL('../../package.json',import.meta.url))('typescript');
  const root=fixture();fs.mkdirSync(path.join(root,'src'));const source=path.join(root,'src/example.ts');fs.writeFileSync(source,'export const answer = 42;');
  const relative='.next-preview/configs/verify.json';const configPath=path.join(root,relative);fs.mkdirSync(path.dirname(configPath),{recursive:true});
  const config=createPreviewTsconfig(root,relative,{compilerOptions:{module:'esnext',moduleResolution:'bundler',baseUrl:'.',paths:{'@/*':['./*']},skipLibCheck:true},include:['src/**/*.ts'],exclude:['node_modules','.next-preview']});
  assert.equal(config.compilerOptions.baseUrl,undefined);
  const parsed=ts.parseJsonConfigFileContent(config,ts.sys,path.dirname(configPath));
  const found=ts.resolveModuleName('@/src/example',path.join(root,'entry.ts'),parsed.options,ts.sys).resolvedModule;
  assert.equal(path.resolve(found.resolvedFileName),path.resolve(source));
  assert(!ts.createProgram([source],parsed.options).getOptionsDiagnostics().some(d=>d.code===5101));
});
