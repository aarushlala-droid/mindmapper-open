import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { validateMap } from '../../../src/services/validation';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return json({ error: 'Sign in to open your maps.' }, 401);
  if (!env.DB) return json({ error: 'Map storage is unavailable. Please retry.' }, 503);
  const url = new URL(request.url);
  const mapId = url.searchParams.get('history');
  if (mapId) {
    const version = url.searchParams.get('version');
    if (version) {
      const row = await env.DB.prepare('SELECT data FROM revisions WHERE owner = ? AND map_id = ? AND version = ?').bind(user.userId, mapId, Number(version)).first<{data: string}>();
      return row ? json({ map: JSON.parse(row.data) }) : json({ error: 'Version not found.' }, 404);
    }
    const rows = await env.DB.prepare('SELECT version, saved_at AS savedAt, deleted FROM revisions WHERE owner = ? AND map_id = ? ORDER BY version DESC LIMIT 100').bind(user.userId, mapId).all();
    return json({ revisions: rows.results });
  }
  const rows = await env.DB.prepare('SELECT data, version, deleted FROM maps WHERE owner = ? ORDER BY updated_at DESC').bind(user.userId).all<{data: string; version: number; deleted: number}>();
  return json({ user: { id: user.userId, name: user.displayName }, maps: rows.results.map(r => ({ map: JSON.parse(r.data), version: r.version, deleted: Boolean(r.deleted) })) });
}

export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return json({ error: 'Sign in to save your maps.' }, 401);
  if (!env.DB) return json({ error: 'Map storage is unavailable. Your draft is kept on this device.' }, 503);
  if (request.headers.get('sec-fetch-site') === 'cross-site' || !request.headers.get('content-type')?.includes('application/json')) return json({ error: 'Invalid request.' }, 403);
  const raw = await request.text();
  if (raw.length > 8_000_000) return json({ error: 'This map exceeds 8 MB. Reduce image sizes, then retry.' }, 413);
  let body;
  try { body = JSON.parse(raw); } catch { return json({ error: 'Invalid JSON.' }, 400); }
  if (!body || typeof body !== 'object') return json({ error: 'Invalid map.' }, 400);
  const { map, expectedVersion, deleted = false } = body;
  if (!validateMap(map) || !Number.isSafeInteger(expectedVersion) || expectedVersion < 0 || typeof deleted !== 'boolean') return json({ error: 'Invalid map structure.' }, 400);
  const version = expectedVersion + 1;
  const savedAt = Date.now();
  const data = JSON.stringify({ ...map, updatedAt: savedAt });
  const mutation = expectedVersion === 0
    ? env.DB.prepare('INSERT INTO maps (owner, id, data, version, deleted, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(owner, id) DO NOTHING RETURNING version').bind(user.userId, map.id, data, version, +deleted, savedAt)
    : env.DB.prepare('UPDATE maps SET data = ?, version = ?, deleted = ?, updated_at = ? WHERE owner = ? AND id = ? AND version = ? RETURNING version').bind(data, version, +deleted, savedAt, user.userId, map.id, expectedVersion);
  // D1 batch is transactional. Only snapshot the matching successful mutation.
  const snapshot = env.DB.prepare('INSERT OR IGNORE INTO revisions (owner, map_id, version, data, deleted, saved_at) SELECT owner, id, version, data, deleted, updated_at FROM maps WHERE owner = ? AND id = ? AND version = ? AND data = ?').bind(user.userId, map.id, version, data);
  const results = await env.DB.batch([mutation, snapshot]);
  if (!results[0].results.length) {
    const row = await env.DB.prepare('SELECT data, version, deleted FROM maps WHERE owner = ? AND id = ?').bind(user.userId, map.id).first<{data: string; version: number; deleted: number}>();
    return json({ error: 'Another device updated this map.', current: row ? { map: JSON.parse(row.data), version: row.version, deleted: Boolean(row.deleted) } : null }, 409);
  }
  return json({ version, savedAt });
}
