import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const isPreviewDistDir=value=>typeof value==='string'&&/^\.next-preview\/releases\/[a-z0-9-]+$/.test(value);

export function createPreviewTsconfig(project,configPath,original){
  const absolute=pattern=>path.resolve(project,pattern).replaceAll('\\','/');
  const {baseUrl,...options}=original.compilerOptions;
  const aliasRoot=path.resolve(project,baseUrl??'.');
  const configDirectory=path.dirname(path.resolve(project,configPath));
  const paths=Object.fromEntries(Object.entries(options.paths??{}).map(([alias,targets])=>[
    alias,targets.map(target=>path.relative(configDirectory,path.resolve(aliasRoot,target)).replaceAll('\\','/')),
  ]));
  return {...original,compilerOptions:{...options,paths,tsBuildInfoFile:absolute(configPath+'.tsbuildinfo')},include:original.include.map(absolute),exclude:original.exclude.map(absolute)};
}

export function inspectPreviewBuild(output,expectedId){
  const missing=[];
  for(const file of ['BUILD_ID','routes-manifest.json','build-manifest.json','prerender-manifest.json','required-server-files.json','server/app-paths-manifest.json']){
    if(!fs.existsSync(path.join(output,file)))missing.push(file);
  }
  let buildId;try{buildId=fs.readFileSync(path.join(output,'BUILD_ID'),'utf8').trim();}catch{}
  if(expectedId&&buildId!==expectedId)missing.push('BUILD_ID mismatch');
  try{
    const routes=JSON.parse(fs.readFileSync(path.join(output,'server/app-paths-manifest.json'),'utf8'));
    for(const file of Object.values(routes)){
      if(typeof file!=='string'||file.includes('..')||path.isAbsolute(file)){missing.push('invalid app route');continue;}
      if(!fs.existsSync(path.join(output,'server',file)))missing.push('server/'+file);
      if(file.endsWith('/page.js')){
        const client=file.replace(/\.js$/,'_client-reference-manifest.js');
        if(!fs.existsSync(path.join(output,'server',client)))missing.push('server/'+client);
      }
    }
  }catch{if(!missing.includes('server/app-paths-manifest.json'))missing.push('invalid app-paths-manifest');}
  return {ready:missing.length===0,buildId,missing};
}

export function acquirePreviewLock(directory){
  fs.mkdirSync(directory,{recursive:true});
  const file=path.join(directory,'demo-process-lock.json');
  const token=crypto.randomUUID();
  for(let attempt=0;attempt<2;attempt++){
    try{
      const fd=fs.openSync(file,'wx');
      fs.writeFileSync(fd,JSON.stringify({pid:process.pid,token,startedAt:new Date().toISOString()}));fs.closeSync(fd);
      return ()=>{try{if(JSON.parse(fs.readFileSync(file,'utf8')).token===token)fs.unlinkSync(file);}catch{}};
    }catch(error){
      if(error.code!=='EEXIST')throw error;
      let owner;try{owner=JSON.parse(fs.readFileSync(file,'utf8'));}catch{throw Error('Preview lock is unreadable; inspect demo-process-lock.json before retrying.');}
      let alive=true;try{process.kill(owner.pid,0);}catch(probe){if(probe.code==='ESRCH')alive=false;}
      if(alive)throw Error('A CRM preview is already running for this runtime. Stop it before starting another launcher.');
      fs.unlinkSync(file);
    }
  }
  throw Error('Could not acquire preview lock.');
}
