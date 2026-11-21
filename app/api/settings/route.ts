import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { normalizePreferences } from '../../../src/services/preferences';
export const dynamic = 'force-dynamic';
const json = (body:unknown,status=200) => Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function GET() {
  const user = await getChatGPTUser(); if (!user) return json({error:'Sign in required.'},401);
  if (!env.DB) return json({error:'Storage unavailable.'},503);
  const row = await env.DB.prepare('SELECT data FROM settings WHERE owner = ?').bind(user.userId).first<{data:string}>();
  return json({preferences:normalizePreferences(row ? JSON.parse(row.data) : null)});
}
export async function PUT(request:Request) {
  const user = await getChatGPTUser(); if (!user) return json({error:'Sign in required.'},401);
  if (!env.DB) return json({error:'Storage unavailable.'},503);
  if (request.headers.get('sec-fetch-site') === 'cross-site' || !request.headers.get('content-type')?.includes('application/json')) return json({error:'Invalid request.'},403);
  const raw = await request.text(); if(raw.length > 10000) return json({error:'Settings too large.'},413);
  let body; try{body=JSON.parse(raw);}catch{return json({error:'Invalid JSON.'},400);}
  if(!body || typeof body.preferences !== 'object') return json({error:'Invalid settings.'},400);
  const preferences = normalizePreferences(body.preferences);
  await env.DB.prepare('INSERT INTO settings (owner, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(owner) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at').bind(user.userId,JSON.stringify(preferences),Date.now()).run();
  return json({preferences});
}
