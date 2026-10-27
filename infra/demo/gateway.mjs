// Local-only Supabase gateway; no extra image or global reverse proxy required.
import http from 'node:http';
const routes = [['/auth/v1',54342],['/rest/v1',54343],['/storage/v1',54344]];
http.createServer((req,res)=>{
  if(req.url==='/health'){res.writeHead(200);res.end('crm-demo-gateway-v1');return;}
  const route=routes.find(([prefix])=>req.url===prefix||req.url.startsWith(prefix+'/')||req.url.startsWith(prefix+'?'));
  if(!route){res.writeHead(404);res.end();return;}
  const headers={...req.headers,'x-forwarded-host':req.headers.host,'x-forwarded-proto':'http'};
  // Supabase clients use apikey for admin calls; GoTrue needs Authorization.
  if(!headers.authorization&&headers.apikey)headers.authorization=`Bearer ${headers.apikey}`;
  const proxy=http.request({hostname:'127.0.0.1',port:route[1],method:req.method,path:req.url.slice(route[0].length)||'/',headers},upstream=>{
    res.writeHead(upstream.statusCode,upstream.headers);upstream.pipe(res);
  });
  proxy.on('error',()=>{res.writeHead(502);res.end('Local Supabase unavailable');});req.pipe(proxy);
}).listen(54340,'127.0.0.1');
