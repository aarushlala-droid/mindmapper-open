# Mindmapper

> **Public mirror.** A sanitised copy of a private working repo, updated by a one-way sync. Fork it and experiment freely. Issues and pull requests are welcome: accepted changes are folded into the private repo by hand and reappear here on the next sync. MIT licensed.
>
> Hosting is built on a Cloudflare D1 starter with ChatGPT sign-in. The original hosting project ID is not included: give your fork its own project and database before deploying. The canvas, layout, export and folder logic in `src/` work without any of that.

A Miro-inspired mindmapping workspace, adapted from the original Google AI Studio React app. The original WW2 analysis (48 ideas) and product strategy map are preserved in `src/services/storage.ts`. Dense WW2 branches start collapsed for readability; expand the count badges to see every idea.

## Data protection

- Cloudflare D1 is the primary store, provisioned by Sites through `.openai/hosting.json`.
- Each API request requires ChatGPT sign-in and scopes queries to the authenticated Site user ID.
- Each successful write creates an immutable revision in the same database transaction. History exposes the 100 most recent versions; older revisions remain in the database.
- Every edit enters a local draft journal immediately. Serialized cloud saves retry on reconnect, every 30 seconds while visible, and on returning to the tab. Errors remain visible; the UI only reports a cloud save after the API confirms it.
- Optimistic versions prevent silent overwrites between devices. Conflicting local edits become a separate recovered copy.
- Deleted maps stay in trash. Restoring a map or revision makes a new cloud save.
- My maps → Backup all maps downloads a portable JSON backup (including trash). Import accepts original workspace backups or a single exported map and preserves existing maps by creating copies on ID collisions.
- Browser storage is a recovery layer, not the primary database. If device storage is full, keep the tab open until the cloud save finishes or download a backup.

No hosted system can promise zero loss. Keep periodic independent JSON backups. Images attached as external URLs still depend on that external host; uploaded image data is part of the saved map. Maps currently support 5,000 ideas, depth 100, and 8 MB per cloud save.

## Personal controls and text editing

Settings stores the font, device-writing preference, and every keyboard command in an authenticated, account-scoped D1 settings row. Preferences reload from the cloud each session; a local pending copy survives an interrupted settings save and retries on reconnect. Enter creates a child branch by default; Tab creates a sibling. Both commands can finish an inline edit and create the branch without dropping the current text. Shift+Enter normally inserts a newline. Every shortcut is editable or clearable in Settings, and the shortcuts panel uses the saved bindings.

Gill Sans is the default font, using Gill Sans MT / Calibri / sans-serif fallbacks on devices where it is unavailable. Choose another font or name an installed custom font. Canvas measurement and PNG/PDF/SVG wrapping use the chosen font. Device spellcheck and autocorrect are enabled by default; actual correction behaviour is supplied by the device and browser.

Right-click a node for edit, add child/sibling, duplicate, image, bold, collapse and delete actions. Right-click the background for canvas commands and Settings. Shift+F10 opens the selected idea's menu by default; menus support arrow keys and Escape. Text fields retain the native text-selection and spelling context menu.

Inline node textareas grow on every input, including pasted paragraphs and unbroken text. Actual rendered text height feeds tree layout so adjacent branches make room. Textareas have no internal scrollbar; the canvas moves to keep the caret visible. The outline's idea and note fields also grow with their content. Text edits enter the local draft journal while typing, before blur or Enter.

## Development

Node 22.13+ is required. Run `npm ci`, then `npm run db:generate` only after schema edits. Build with `node <sites-plugin>/scripts/build-site.mjs` and apply each pending generated migration to the local DB as described in the Sites starter documentation. Run `npm run dev` on loopback, then visit `/signin-with-chatgpt?return_to=/` for the local test identity. Local and production data are separate.

Checks: `npx tsc --noEmit`; `node tests/settings-and-layout.mjs` covers cloud settings, shortcuts, and wrapping; with the local dev server and migrated local database running on port 5173, `node tests/persistence.mjs`. The test creates and trashes only named verification maps in the local database.

Publish using the Sites source workflow with the same persisted project ID; it synchronizes source, builds, packages, applies hosted migrations and publishes the private Site. Never change the project ID to deploy an update: identity and database data belong to that Site.

## Cleanup and connections

Clean up resets manual offsets in a single undoable edit and fits the map after reflow. It retains all text, notes, images, parent-child relationships, collapsed states, theme and extra metadata. Branch lines default to the centre of each box; the node context menu can switch an individual node to a bottom attachment.

Link ideas adds labelled, dashed connections between any two existing ideas. These live in an optional `links` array, separate from the parent-child tree. Add/remove uses the same autosave, revision history, import/export and undo flow. Missing endpoints, duplicate links and self-links are rejected. Links to collapsed descendants stay saved and become visible when expanded. Deleting a branch removes incident links in the same undoable edit. PNG, PDF and SVG exports include extra connections.

Text geometry includes borders and actual rendered sizes. Resize observers handle initial loading, wrapping and font changes without discarding the first measurements. `node tests/cleanup-and-links.mjs` checks five real saved maps for content preservation and 1,220 pairs of node boxes for collisions after cleanup.

### Folders and subfolders
Open the map library to use the folder sidebar. Create folders or select a folder and choose New subfolder. Selected folders offer rename and move controls; each map card has a Move to folder button. All maps always shows the full workspace, and Unfiled shows maps without a recognised folder. New maps use the selected folder.

Folder organisation is authenticated and stored in D1, with a device journal for pending offline changes. Server updates retry against the latest folder tree, retaining concurrent changes and rejecting circular moves. Workspace JSON backups include folders and map membership. Imports preserve existing maps and create a separate imported folder branch when folder IDs conflict. Migration 0002 adds a separate folder table without changing existing map records.
