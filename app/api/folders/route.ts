import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../chatgpt-auth';
import {applyFolderCommand,type MapFolder,type FolderCommand} from '../../../src/services/folder-model';
export const dynamic='force-dynamic';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){const user=await getChatGPTUser();if(!user)return json({error:'Sign in required.'},401);if(!env.DB)return json({error:'Storage unavailable.'},503);const row=await env.DB.prepare('SELECT data FROM workspace_folders WHERE owner = ?').bind(user.userId).first<{data:string}>();return json({folders:row?JSON.parse(row.data):[]});}
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return json({error:'Sign in required.'},401);if(!env.DB)return json({error:'Storage unavailable.'},503);
 if(request.headers.get('sec-fetch-site')==='cross-site'||!request.headers.get('content-type')?.includes('application/json'))return json({error:'Invalid request.'},403);
 const raw=await request.text();if(raw.length>2000)return json({error:'Folder action too large.'},413);let command:FolderCommand;try{command=JSON.parse(raw);}catch{return json({error:'Invalid JSON.'},400);}
 // Retry against the latest tree so simultaneous creates and moves cannot form cycles or discard other folders.
 for(let attempt=0;attempt<4;attempt++){
   const row=await env.DB.prepare('SELECT data, version FROM workspace_folders WHERE owner = ?').bind(user.userId).first<{data:string;version:number}>();
   let folders:MapFolder[];try{folders=applyFolderCommand(row?JSON.parse(row.data):[],command);}catch(e){return json({error:e instanceof Error?e.message:'Invalid folder action.'},400);}
   const query=row?env.DB.prepare('UPDATE workspace_folders SET data = ?, version = version + 1 WHERE owner = ? AND version = ? RETURNING version').bind(JSON.stringify(folders),user.userId,row.version):env.DB.prepare('INSERT INTO workspace_folders (owner, data, version) VALUES (?, ?, 1) ON CONFLICT(owner) DO NOTHING RETURNING version').bind(user.userId,JSON.stringify(folders));
   const result=await query.all();if(result.results.length)return json({folders});
 }
 return json({error:'Folders changed on another device. Please retry.'},409);
}
