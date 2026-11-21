import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';
export const maps = sqliteTable('maps', {
  owner: text('owner').notNull(), id: text('id').notNull(), data: text('data').notNull(),
  version: integer('version').notNull(), deleted: integer('deleted').notNull().default(0), updatedAt: integer('updated_at').notNull(),
}, t => [primaryKey({ columns: [t.owner, t.id] }), index('maps_owner_updated').on(t.owner, t.updatedAt)]);
export const revisions = sqliteTable('revisions', {
  owner: text('owner').notNull(), mapId: text('map_id').notNull(), version: integer('version').notNull(),
  data: text('data').notNull(), deleted: integer('deleted').notNull(), savedAt: integer('saved_at').notNull(),
}, t => [primaryKey({ columns: [t.owner, t.mapId, t.version] })]);
export const settings = sqliteTable('settings', {
  owner: text('owner').primaryKey(), data: text('data').notNull(), updatedAt: integer('updated_at').notNull(),
});
export const workspaceFolders = sqliteTable('workspace_folders', {
  owner: text('owner').primaryKey(), data: text('data').notNull(), version: integer('version').notNull(),
});
