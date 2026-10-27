import {loadLocalEnvironment,nextBin,prepareCache,runNode} from './lib/local-runtime.mjs';

try{
  process.env.NODE_ENV='development';loadLocalEnvironment();prepareCache('dev');
  process.env.CRM_LOCAL_DEV='1';
  const args=process.argv.slice(2).filter(arg=>arg!=='--');
  const hostIndex=args.findIndex(arg=>arg==='--hostname'||arg==='-H');
  const suppliedHost=args.find(arg=>arg.startsWith('--hostname='))?.split('=')[1]??args.find(arg=>arg.startsWith('-H')&&arg.length>2)?.slice(2)??(hostIndex>=0?args[hostIndex+1]:undefined);
  if(suppliedHost && !['localhost','127.0.0.1','::1','[::1]'].includes(suppliedHost))process.env.CRM_DEMO_MODE='false';
  const hostArgs=suppliedHost?[]:['--hostname','127.0.0.1'];
  process.exitCode=await runNode([nextBin,'dev','--webpack',...hostArgs,...args],{env:{NODE_OPTIONS:process.env.NODE_OPTIONS||'--max-old-space-size=6144'}});
}catch(error){console.error(error.message);process.exitCode=1;}
