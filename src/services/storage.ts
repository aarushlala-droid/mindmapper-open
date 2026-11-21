import { folderService } from './folders';
import { validateFolders } from './folder-model';
import { MindMap, MindMapNode } from '../types/mindmap';
import { validateMap } from './validation';

const STORAGE_KEY = 'miro_mindmaps_studio_v1';
const CURRENT_MAP_ID_KEY = 'miro_current_map_id';

/**
 * Creates the authentic initial mindmap from the user's uploaded Miro screenshot.
 */
export function createWW2MiroTemplate(): MindMap {
  const nodes: Record<string, MindMapNode> = {};

  const rootId = 'root-ww2';
  nodes[rootId] = {
    id: rootId,
    text: "Was Hitler's foreign policy the main reason for WW2",
    parentId: null,
    childrenIds: ['r1', 'r2', 'r3', 'r4', 'r5', 'l1', 'l2', 'l3'],
    nodeStyle: 'bubble',
    color: '#3B82F6',
    fontSize: 'lg',
    isBold: true,
  };

  // --- RIGHT BRANCH 1: Long term consequences of ToV (Purple) ---
  nodes['r1'] = {
    id: 'r1',
    text: 'Long term consequences of ToV',
    parentId: rootId,
    side: 'right',
    color: '#8B5CF6',
    childrenIds: ['r1-1', 'r1-2', 'r1-3', 'r1-4'],
  };
  nodes['r1-1'] = {
    id: 'r1-1',
    text: 'Dissatisfied Nations: Germany was furious, Italy felt cheated, Japan wasn\'t happy because of racist policies. UK thought it was too harsh, France believed it was not harsh enough.',
    parentId: 'r1',
    childrenIds: [],
  };
  nodes['r1-2'] = {
    id: 'r1-2',
    text: 'Left G as a nation that was not a powerful country in Europe, in the contrary to what they wanted.',
    parentId: 'r1',
    childrenIds: [],
  };
  nodes['r1-3'] = {
    id: 'r1-3',
    text: 'ToV was very unpopular in Germany, and so it led to Hitler\'s foreign policy being directly oriented to countering the terms of the ToV',
    parentId: 'r1',
    childrenIds: [],
  };
  nodes['r1-4'] = {
    id: 'r1-4',
    text: 'Inconsistent territories in Europe - places like the sudetenland, which were primarily German inhabited was given to the Czechs',
    parentId: 'r1',
    childrenIds: [],
  };

  // --- RIGHT BRANCH 2: Consequences/aftermath of LoN failures (Pink) ---
  nodes['r2'] = {
    id: 'r2',
    text: 'Consequences/aftermath of LoN failures',
    parentId: rootId,
    side: 'right',
    color: '#EC4899',
    childrenIds: ['r2-1', 'r2-2', 'r2-3', 'r2-4'],
  };
  nodes['r2-1'] = {
    id: 'r2-1',
    text: 'Manchuria - The Lytton report proved that the League had no power outside of Europe, and that it didn\'t have power to stop wars. Also, distracted the League.',
    parentId: 'r2',
    childrenIds: [],
  };
  nodes['r2-2'] = {
    id: 'r2-2',
    text: 'Abyssinia: Showed how weak the League was in dealing with its own member nations, and that it didn\'t have power to stop wars. Distracted the League while Germany began it\'s remilitarisation. Made the League seem like liars.',
    parentId: 'r2',
    childrenIds: [],
  };
  nodes['r2-3'] = {
    id: 'r2-3',
    text: 'Disarmament - Was extremely unsuccessful - Germany pulled out of the disarmament treaty and then walked out of the League. In fact, most countries didn\'t even want disarmament.',
    parentId: 'r2',
    childrenIds: [],
  };
  nodes['r2-4'] = {
    id: 'r2-4',
    text: 'Appeasement: While rearmament happened, the Allies were too scared to get into war with Germany, so was forced to appease them.',
    parentId: 'r2',
    childrenIds: [],
  };

  // --- RIGHT BRANCH 3: Hitler foreign policy aims (Magenta) ---
  nodes['r3'] = {
    id: 'r3',
    text: 'Hitler foreign policy aims',
    parentId: rootId,
    side: 'right',
    color: '#D946EF',
    childrenIds: ['r3-1', 'r3-2', 'r3-3', 'r3-4', 'r3-5', 'r3-6'],
  };
  nodes['r3-1'] = {
    id: 'r3-1',
    text: 'Living Space - He wanted to increase the space for ethno-germans to live in, specifically german citizens. To do this, he would invade surrounding nations. Lebensraum',
    parentId: 'r3',
    childrenIds: [],
  };
  nodes['r3-2'] = {
    id: 'r3-2',
    text: 'Anschluss - He wanted to reunite with Austria, in part to increase living space, but also to bring all germans together',
    parentId: 'r3',
    childrenIds: [],
  };
  nodes['r3-3'] = {
    id: 'r3-3',
    text: 'Greater European empire - unite all of europe under german rule',
    parentId: 'r3',
    childrenIds: [],
  };
  nodes['r3-4'] = {
    id: 'r3-4',
    text: 'Destroy ToV - remilitarise, take over all of the colonies that had been stripped away, restore german economic prosperity - everything that the treaty had been against',
    parentId: 'r3',
    childrenIds: [],
  };
  nodes['r3-5'] = {
    id: 'r3-5',
    text: 'Destroy communism - he wanted to eradicate all of communism, starting with getting rid of the USSR (to do this he first allied with them though).',
    parentId: 'r3',
    childrenIds: [],
  };
  nodes['r3-6'] = {
    id: 'r3-6',
    text: 'Global domination - after controlling Europe, he would control the british empire, and then wage war against america for global control.',
    parentId: 'r3',
    childrenIds: [],
  };

  // --- RIGHT BRANCH 4: Italian German relations (Deep Rose - screenshot 2!) ---
  nodes['r4'] = {
    id: 'r4',
    text: 'Italian German relations',
    parentId: rootId,
    side: 'right',
    color: '#E11D48',
    childrenIds: ['r4-1', 'r4-2', 'r4-3', 'r4-4', 'r4-5', 'r4-6', 'r4-7'],
  };
  nodes['r4-1'] = {
    id: 'r4-1',
    text: 'July 1934 - Italy opposes Anschluss, only country who takes troops to the Austrian border to prevent them from uniting',
    parentId: 'r4',
    childrenIds: [],
  };
  nodes['r4-2'] = {
    id: 'r4-2',
    text: 'Stresa Front - 1935 - I joins pact with UK and France to limit German re-militarisation',
    parentId: 'r4',
    childrenIds: [],
  };
  nodes['r4-3'] = {
    id: 'r4-3',
    text: 'Abyssinia 1936 - Italy continues to trade with Germany during the crisis, fostering ties',
    parentId: 'r4',
    childrenIds: [],
  };
  nodes['r4-4'] = {
    id: 'r4-4',
    text: 'Spanish Civil war 1936 - During the 3 year long war, Italy support Germany militarily',
    parentId: 'r4',
    childrenIds: [],
  };
  nodes['r4-5'] = {
    id: 'r4-5',
    text: 'Rome-Berlin Axis 1936 - Mussolini and Hitler agree an informal pact of support for each other',
    parentId: 'r4',
    childrenIds: [],
  };
  nodes['r4-6'] = {
    id: 'r4-6',
    text: '1938 - Mussolini agrees to the Anschluss, and also persuades Germany to agree to the Munich Conference (sudetenland)',
    parentId: 'r4',
    childrenIds: [],
  };
  nodes['r4-7'] = {
    id: 'r4-7',
    text: '1939 - Pact of Steel - Military pact between Italy and Germany saying that they will protect each other in war',
    parentId: 'r4',
    childrenIds: [],
  };

  // --- RIGHT BRANCH 5: Overall causes of WW2 (Lime / Amber) ---
  nodes['r5'] = {
    id: 'r5',
    text: 'Overall causes of WW2',
    parentId: rootId,
    side: 'right',
    color: '#84CC16',
    childrenIds: ['r5-1', 'r5-2', 'r5-3', 'r5-4', 'r5-5'],
  };
  nodes['r5-1'] = {
    id: 'r5-1',
    text: 'Failure of LoN',
    parentId: 'r5',
    childrenIds: ['r5-1a', 'r5-1b'],
  };
  nodes['r5-1a'] = {
    id: 'r5-1a',
    text: 'Critical: The failures in Abyssinia and Manchuria showed Hitler could do whatever he wanted',
    parentId: 'r5-1',
    childrenIds: [],
  };
  nodes['r5-1b'] = {
    id: 'r5-1b',
    text: 'Important: Provided encouragement to Hitler while UK and France were already strained',
    parentId: 'r5-1',
    childrenIds: [],
  };
  nodes['r5-2'] = {
    id: 'r5-2',
    text: 'Treaty of Versailles',
    parentId: 'r5',
    childrenIds: ['r5-2a'],
  };
  nodes['r5-2a'] = {
    id: 'r5-2a',
    text: 'Provided the political firewood Hitler needed to come into power',
    parentId: 'r5-2',
    childrenIds: [],
  };
  nodes['r5-3'] = {
    id: 'r5-3',
    text: 'Appeasement',
    parentId: 'r5',
    childrenIds: ['r5-3a'],
  };
  nodes['r5-3a'] = {
    id: 'r5-3a',
    text: 'It made him think he could get away with anything; emboldened territorial conquest',
    parentId: 'r5-3',
    childrenIds: [],
  };
  nodes['r5-4'] = {
    id: 'r5-4',
    text: 'Hitlers actions',
    parentId: 'r5',
    childrenIds: [],
  };
  nodes['r5-5'] = {
    id: 'r5-5',
    text: 'Great depression',
    parentId: 'r5',
    childrenIds: [],
  };

  // --- LEFT BRANCH 1: Views on Hitler (Orange) ---
  nodes['l1'] = {
    id: 'l1',
    text: 'Views on Hitler',
    parentId: rootId,
    side: 'left',
    color: '#F97316',
    childrenIds: ['l1-1', 'l1-2'],
  };
  nodes['l1-1'] = {
    id: 'l1-1',
    text: 'One view is that Hitler was a mastermind or long term planner who actively planned out what was going to happen.',
    parentId: 'l1',
    childrenIds: [],
  };
  nodes['l1-2'] = {
    id: 'l1-2',
    text: 'The other view is that Hitler was a power seeking opportunist who was going for short term wins and had good luck.',
    parentId: 'l1',
    childrenIds: [],
  };

  // --- LEFT BRANCH 2: Hitler\'s actions before the war (Amber) ---
  nodes['l2'] = {
    id: 'l2',
    text: "Hitler's actions before the war",
    parentId: rootId,
    side: 'left',
    color: '#EAB308',
    childrenIds: ['l2-1', 'l2-2', 'l2-3', 'l2-4', 'l2-5'],
  };
  nodes['l2-1'] = {
    id: 'l2-1',
    text: 'Spanish Civil War intervention - Served as a testing ground for technologies to use later on (bombings at Guernica)',
    parentId: 'l2',
    childrenIds: [],
  };
  nodes['l2-2'] = {
    id: 'l2-2',
    text: 'Invades poland - Turning point between appeasement and war',
    parentId: 'l2',
    childrenIds: [],
  };
  nodes['l2-3'] = {
    id: 'l2-3',
    text: 'USSR-Germany pact of non-aggression - Meant Germany did not need to fight a 2-front war initially',
    parentId: 'l2',
    childrenIds: [],
  };
  nodes['l2-4'] = {
    id: 'l2-4',
    text: 'Munich Conference - Britain and France appeased Hitler by ceding Sudetenland',
    parentId: 'l2',
    childrenIds: [],
  };
  nodes['l2-5'] = {
    id: 'l2-5',
    text: '1936 Remilitarisation of the Rhineland - French and British inaction allowed momentum',
    parentId: 'l2',
    childrenIds: [],
  };

  // --- LEFT BRANCH 3: Was appeasement justified (Yellow) ---
  nodes['l3'] = {
    id: 'l3',
    text: 'Was appeasement justified',
    parentId: rootId,
    side: 'left',
    color: '#FACC15',
    childrenIds: ['l3-1', 'l3-2'],
  };
  nodes['l3-1'] = {
    id: 'l3-1',
    text: 'Yes - Bought time for re-arming; public sentiment was traumatised from WW1; feared communism more',
    parentId: 'l3',
    childrenIds: [],
  };
  nodes['l3-2'] = {
    id: 'l3-2',
    text: 'No - Gave Hitler a springboard on the continent; allowed military expansion; sent message allies would fold',
    parentId: 'l3',
    childrenIds: [],
  };

  // Start this dense reference map with readable, expandable main branches.
  for (const id of nodes[rootId].childrenIds) nodes[id].isCollapsed = true;

  return {
    id: 'ww2-foreign-policy',
    title: "WW2 Foreign Policy Analysis",
    rootId,
    nodes,
    layout: 'radial',
    nodeStyle: 'underline',
    theme: 'miro-vibrant',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 3600000,
  };
}

export function createBlankTemplate(title: string = 'Untitled Mind Map'): MindMap {
  const rootId = `root-${Date.now()}`;
  const node1 = `node-${Date.now()}-1`;
  const node2 = `node-${Date.now()}-2`;
  const node3 = `node-${Date.now()}-3`;

  return {
    id: `map-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title,
    rootId,
    nodes: {
      [rootId]: {
        id: rootId,
        text: title,
        parentId: null,
        childrenIds: [node1, node2, node3],
        nodeStyle: 'bubble',
        color: '#3B82F6',
        fontSize: 'lg',
        isBold: true,
      },
      [node1]: {
        id: node1,
        text: 'Main Idea 1',
        parentId: rootId,
        side: 'right',
        color: '#EC4899',
        childrenIds: [],
      },
      [node2]: {
        id: node2,
        text: 'Main Idea 2',
        parentId: rootId,
        side: 'right',
        color: '#8B5CF6',
        childrenIds: [],
      },
      [node3]: {
        id: node3,
        text: 'Main Idea 3',
        parentId: rootId,
        side: 'left',
        color: '#10B981',
        childrenIds: [],
      },
    },
    layout: 'radial',
    nodeStyle: 'underline',
    theme: 'miro-vibrant',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function createProductStrategyTemplate(): MindMap {
  const rootId = `root-prod-${Date.now()}`;
  const b1 = `b1-${Date.now()}`;
  const b2 = `b2-${Date.now()}`;
  const b3 = `b3-${Date.now()}`;
  const b4 = `b4-${Date.now()}`;

  return {
    id: `prod-roadmap-${Date.now()}`,
    title: 'Product Strategy & Roadmap',
    rootId,
    nodes: {
      [rootId]: {
        id: rootId,
        text: 'Next-Gen Mindmapping App',
        parentId: null,
        childrenIds: [b1, b2, b3, b4],
        nodeStyle: 'bubble',
        color: '#2563EB',
        fontSize: 'lg',
        isBold: true,
      },
      [b1]: {
        id: b1,
        text: 'User Experience (UX)',
        parentId: rootId,
        side: 'right',
        color: '#06B6D4',
        childrenIds: [`${b1}-sub1`, `${b1}-sub2`],
      },
      [`${b1}-sub1`]: {
        id: `${b1}-sub1`,
        text: 'Zero-friction keyboard branch creation (Tab & Enter)',
        parentId: b1,
        childrenIds: [],
      },
      [`${b1}-sub2`]: {
        id: `${b1}-sub2`,
        text: 'Organic Miro Bézier curves with dynamic line tapering',
        parentId: b1,
        childrenIds: [],
      },
      [b2]: {
        id: b2,
        text: 'Export & Sharing',
        parentId: rootId,
        side: 'right',
        color: '#10B981',
        childrenIds: [`${b2}-sub1`, `${b2}-sub2`],
      },
      [`${b2}-sub1`]: {
        id: `${b2}-sub1`,
        text: 'High-res 4x PNG and Vector SVG',
        parentId: b2,
        childrenIds: [],
      },
      [`${b2}-sub2`]: {
        id: `${b2}-sub2`,
        text: 'Multi-page or single fit PDF documents',
        parentId: b2,
        childrenIds: [],
      },
      [b3]: {
        id: b3,
        text: 'Cloud Sync & Multi-Map',
        parentId: rootId,
        side: 'left',
        color: '#8B5CF6',
        childrenIds: [`${b3}-sub1`, `${b3}-sub2`],
      },
      [`${b3}-sub1`]: {
        id: `${b3}-sub1`,
        text: 'Instant autosave with cloud synchronization status',
        parentId: b3,
        childrenIds: [],
      },
      [`${b3}-sub2`]: {
        id: `${b3}-sub2`,
        text: 'Switch between unlimited workspaces and mind maps',
        parentId: b3,
        childrenIds: [],
      },
      [b4]: {
        id: b4,
        text: 'Rich Media & Assets',
        parentId: rootId,
        side: 'left',
        color: '#F59E0B',
        childrenIds: [`${b4}-sub1`, `${b4}-sub2`],
      },
      [`${b4}-sub1`]: {
        id: `${b4}-sub1`,
        text: 'Add images to branches via drop, file picker or URL',
        parentId: b4,
        childrenIds: [],
      },
      [`${b4}-sub2`]: {
        id: `${b4}-sub2`,
        text: 'Visual thumbnail attachments with zoomable preview',
        parentId: b4,
        childrenIds: [],
      },
    },
    layout: 'radial',
    nodeStyle: 'underline',
    theme: 'ocean',
    createdAt: Date.now() - 3600000 * 5,
    updatedAt: Date.now() - 1800000,
  };
}

type Entry = { map: MindMap; version: number; deleted: boolean };
type Pending = Entry & { stamp: string };
type ApiReply = { error?: string; user: {id:string;name:string}; maps: Entry[]; current: Entry | null; version: number; savedAt: number; map: MindMap; revisions: {version:number;savedAt:number;deleted:number}[] };
export type SyncState = { state: 'saving' | 'saved' | 'offline' | 'error'; message: string; savedAt?: number };
class StorageService {
  private entries: Record<string, Entry> = Object.create(null);
  private pending: Record<string, Pending> = Object.create(null);
  private listeners = new Set<() => void>();
  private journalKey = '';
  private cacheKey = '';
  private currentKey = '';
  private ready: Promise<void> | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private running: Promise<boolean> | null = null;
  private backupWarning = false;
  userName = '';
  notice = '';
  status: SyncState = { state: 'saving', message: 'Opening your maps…' };

  subscribe = (fn: () => void) => { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; };
  private emit() { for (const listener of this.listeners) listener(); }
  initialize(userId: string): Promise<void> {
    if (this.ready) return this.ready;
    this.ready = this.boot(userId).catch(e => { this.ready = null; throw e; });
    return this.ready;
  }
  private async request(url: string, options?: RequestInit) {
    const response = await fetch(url, { ...options, cache: 'no-store', signal: AbortSignal.timeout(15000) });
    const data = await response.json() as ApiReply;
    return { response, data };
  }
  private async boot(userId: string) {
    const prefix = `mindmapper:${userId}:`;
    this.cacheKey = `${prefix}cache`;
    this.currentKey = `${prefix}current`;
    this.journalKey = `${prefix}draft:${crypto.randomUUID()}`;
    let cloud: Entry[] = [];
    let online = true;
    try {
      const { response, data } = await this.request('/api/maps');
      if (!response.ok) { if (response.status === 401 || response.status === 403) throw new Error('AUTH: Sign in again to open your maps.'); throw new Error(data.error || 'Could not open your maps.'); }
      if (data.user.id !== userId) throw new Error('Your session changed. Reload to continue.');
      cloud = data.maps;
      this.userName = data.user.name;
    } catch (e) {
      const cached = this.read(this.cacheKey);
      // An authenticated server page supplies the user ID; caches never cross accounts.
      if (!cached || (e instanceof Error && e.message.startsWith('AUTH:'))) throw e;
      cloud = cached;
      online = false;
    }
    for (const entry of cloud) if (validateMap(entry.map)) this.entries[entry.map.id] = entry;
    const recoveredKeys: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)!;
        if (!key.startsWith(`${prefix}draft:`)) continue;
        const drafts = this.read(key);
        if (!Array.isArray(drafts)) continue;
        for (const draft of drafts as Pending[]) {
          if (!validateMap(draft.map)) continue;
          const existing = this.pending[draft.map.id];
          if (existing && JSON.stringify(existing.map) !== JSON.stringify(draft.map)) {
            const copy = { ...draft.map, id: crypto.randomUUID(), title: `${draft.map.title} (recovered draft)` };
            this.pending[copy.id] = { map: copy, version: 0, deleted: false, stamp: crypto.randomUUID() };
            this.entries[copy.id] = this.pending[copy.id];
          } else {
            this.pending[draft.map.id] = draft;
            this.entries[draft.map.id] = draft;
          }
        }
        recoveredKeys.push(key);
      }
    } catch { this.backupWarning = true; }
    // Import the original app's data only on this browser and never overwrite cloud maps.
    if (!this.read(`${prefix}legacy-imported`)) {
      const legacy = this.read(STORAGE_KEY);
      if (legacy && typeof legacy === 'object') {
        for (const map of Object.values(legacy)) {
          if (!validateMap(map)) continue;
          const existing = this.entries[map.id];
          if (existing && JSON.stringify(existing.map.nodes) === JSON.stringify(map.nodes) && existing.map.title === map.title) continue;
          const imported = existing ? { ...map, id: crypto.randomUUID(), title: `${map.title} (imported)` } : map;
          this.queue(imported, false, false);
        }
      }
    }
    if (!this.getAllMaps().length && !cloud.length) {
      this.queue(createWW2MiroTemplate(), false, false);
      this.queue(createProductStrategyTemplate(), false, false);
    } else if (!this.getAllMaps().length) {
      this.queue(createBlankTemplate(), false, false);
    }
    if (this.persist()) {
      for (const key of recoveredKeys) localStorage.removeItem(key);
      try { localStorage.setItem(`${prefix}legacy-imported`, 'true'); } catch { this.backupWarning = true; }
    }
    this.status = { state: online ? (Object.keys(this.pending).length ? 'saving' : 'saved') : 'offline', message: online ? 'Saved to cloud' : 'Offline · changes kept on this device' };
    window.addEventListener('online', () => void this.flush());
    window.addEventListener('offline', () => { this.status = { state: 'offline', message: 'Offline · changes kept on this device' }; this.emit(); });
    window.addEventListener('beforeunload', e => {
      if (Object.keys(this.pending).length) { e.preventDefault(); e.returnValue = ''; }
    });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void this.refresh(); });
    window.setInterval(() => { if (navigator.onLine && document.visibilityState === 'visible') void this.refresh(); }, 30000);
    this.emit();
    if (online) void this.flush();
  }
  private read(key: string): any {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
  }
  private persist(): boolean {
    try {
      localStorage.setItem(this.journalKey, JSON.stringify(Object.values(this.pending)));
      localStorage.setItem(this.cacheKey, JSON.stringify(Object.values(this.entries)));
      this.backupWarning = false;
      return true;
    } catch {
      this.backupWarning = true;
      this.status = { state: 'error', message: 'Device backup is full. Keep this tab open until cloud saving finishes.' };
      this.emit();
      return false;
    }
  }
  getAllMaps(): MindMap[] { return Object.values(this.entries).filter(e => !e.deleted).map(e => e.map).sort((a, b) => b.updatedAt - a.updatedAt); }
  getTrash(): MindMap[] { return Object.values(this.entries).filter(e => e.deleted).map(e => e.map); }
  getCurrentMapId(): string {
    let saved: string | null = null;
    try { saved = localStorage.getItem(this.currentKey); } catch { /* Cloud saving is still available. */ }
    return saved && this.getMap(saved) ? saved : this.getAllMaps()[0]?.id;
  }
  setCurrentMapId(id: string) { try { localStorage.setItem(this.currentKey, id); } catch { /* Preference only. */ } }
  getMap(id: string): MindMap | null { const entry = this.entries[id]; return entry && !entry.deleted ? entry.map : null; }
  private queue(map: MindMap, deleted = false, schedule = true) {
    if (!validateMap(map)) throw new Error('This map has an invalid tree. Export a backup before continuing.');
    const updated = { ...map, updatedAt: Date.now() };
    const entry: Pending = { map: updated, version: this.entries[map.id]?.version || 0, deleted, stamp: crypto.randomUUID() };
    this.entries[map.id] = entry;
    this.pending[map.id] = entry;
    this.status = { state: navigator.onLine ? 'saving' : 'offline', message: navigator.onLine ? 'Saving to cloud…' : 'Offline · changes kept on this device' };
    this.persist();
    this.emit();
    if (schedule) {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => void this.flush(), 500);
    }
  }
  saveMap(map: MindMap) { this.queue(map); }
  flush(): Promise<boolean> {
    if (this.running) return this.running;
    this.running = this.sendPending().finally(() => { this.running = null; });
    return this.running;
  }
  private async sendPending(): Promise<boolean> {
    try {
      while (Object.keys(this.pending).length) {
        const [id, draft] = Object.entries(this.pending)[0];
        const { response, data } = await this.request('/api/maps', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ map: draft.map, expectedVersion: draft.version, deleted: draft.deleted }) });
        if (response.status === 409) {
          // Concurrent edits are preserved as a separate map rather than overwritten.
          const latest = this.pending[id] || draft;
          const recovered = { ...latest.map, id: crypto.randomUUID(), title: `${latest.map.title} (recovered copy)` };
          delete this.pending[id];
          if (data.current) this.entries[id] = data.current;
          else delete this.entries[id];
          this.queue(recovered, false, false);
          this.notice = 'Another device changed this map. Your edits are safe in a recovered copy in My maps.';
          this.persist(); this.emit();
          continue;
        }
        if (!response.ok) throw new Error(data.error || 'Cloud save failed. Your draft is kept on this device.');
        const latest = this.pending[id];
        if (latest?.stamp === draft.stamp) {
          delete this.pending[id];
          this.entries[id] = { map: { ...draft.map, updatedAt: data.savedAt }, version: data.version, deleted: draft.deleted };
        } else if (latest) {
          this.pending[id] = { ...latest, version: data.version };
          this.entries[id] = this.pending[id];
        }
        this.persist();
        this.status = { state: 'saved', message: 'Saved to cloud', savedAt: data.savedAt };
        this.emit();
      }
      this.status = { state: this.backupWarning ? 'error' : 'saved', message: this.backupWarning ? 'Saved to cloud · device backup unavailable' : 'Saved to cloud', savedAt: this.status.savedAt };
      this.emit();
      return true;
    } catch (e) {
      this.status = { state: navigator.onLine ? 'error' : 'offline', message: this.backupWarning ? 'Cloud save and device backup unavailable. Download a backup now.' : (navigator.onLine ? (e instanceof Error ? e.message : 'Cloud save failed. Retry.') : 'Offline · changes kept on this device') };
      this.persist(); this.emit();
      return false;
    }
  }
  async refresh() {
    if (this.running || Object.keys(this.pending).length) { await this.flush(); return; }
    try {
      const { response, data } = await this.request('/api/maps');
      if (!response.ok) throw new Error(data.error || 'Unable to refresh maps.');
      // Edits may have arrived while the read was in flight.
      for (const entry of data.maps as Entry[]) if (!this.pending[entry.map.id] && validateMap(entry.map)) this.entries[entry.map.id] = entry;
      this.persist();
      this.status = { state: 'saved', message: 'Saved to cloud', savedAt: this.status.savedAt };
      this.emit();
    } catch (e) { this.status = { state: navigator.onLine ? 'error' : 'offline', message: e instanceof Error ? e.message : 'Could not refresh maps.' }; this.emit(); }
  }
  createMap(type: 'blank' | 'ww2' | 'product' = 'blank', title?: string): MindMap {
    let map = type === 'ww2' ? createWW2MiroTemplate() : type === 'product' ? createProductStrategyTemplate() : createBlankTemplate(title);
    map = { ...map, id: crypto.randomUUID(), title: title || map.title, createdAt: Date.now() };
    this.saveMap(map); this.setCurrentMapId(map.id); return map;
  }
  duplicateMap(id: string): MindMap | null {
    const map = this.getMap(id); if (!map) return null;
    const copy = { ...structuredClone(map), id: crypto.randomUUID(), title: `${map.title} (copy)`, createdAt: Date.now() };
    this.saveMap(copy); return copy;
  }
  deleteMap(id: string): boolean {
    const map = this.getMap(id);
    if (!map || this.getAllMaps().length <= 1) return false;
    this.queue(map, true); return true;
  }
  restoreMap(id: string) { const entry = this.entries[id]; if (entry) this.queue(entry.map, false); }
  exportAllToJson(): string { return JSON.stringify({ version: 3, exportedAt: Date.now(), maps: this.getAllMaps(), trash: this.getTrash(), folders:folderService.folders }, null, 2); }
  importFromJson(json: string): boolean {
    try {
      const data = JSON.parse(json);
      const maps = Array.isArray(data.maps) ? data.maps : data.nodes ? [data] : null;
      if (!maps?.length || !maps.every(validateMap)) return false;
      if(data.folders!==undefined&&!validateFolders(data.folders))return false;
      const folderIds=folderService.importFolders(data.folders);
      for (const original of maps as MindMap[]) {
        const map=original.folderId&&folderIds.has(original.folderId)?{...original,folderId:folderIds.get(original.folderId)}:original;
        const existing = this.entries[map.id];
        const imported = existing ? { ...map, id: crypto.randomUUID(), title: `${map.title} (imported copy)` } : map;
        this.saveMap(imported);
      }
      return true;
    } catch { return false; }
  }
  async getHistory(id: string) {
    const { response, data } = await this.request(`/api/maps?history=${encodeURIComponent(id)}`);
    if (!response.ok) throw new Error(data.error || 'Could not load history.');
    return data.revisions as { version: number; savedAt: number; deleted: number }[];
  }
  async restoreVersion(id: string, version: number) {
    const { response, data } = await this.request(`/api/maps?history=${encodeURIComponent(id)}&version=${version}`);
    if (!response.ok || !validateMap(data.map)) throw new Error(data.error || 'Could not restore version.');
    this.saveMap(data.map);
    return this.flush();
  }
}
export const storageService = new StorageService();
