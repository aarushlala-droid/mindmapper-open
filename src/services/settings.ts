import { DEFAULT_PREFERENCES, normalizePreferences, type Preferences } from './preferences';
class SettingsService {
  preferences = normalizePreferences(DEFAULT_PREFERENCES);
  private key = '';
  private ready: Promise<void> | null = null;
  private pending = false;
  private listeners = new Set<() => void>();
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private emit() { this.listeners.forEach(l => l()); }
  initialize(userId: string) {
    if (this.ready) return this.ready;
    this.key = `mindmapper:${userId}:settings`;
    this.ready = this.load();
    return this.ready;
  }
  private async load() {
    let local: { preferences: Preferences; pending: boolean } | null = null;
    try { local = JSON.parse(localStorage.getItem(this.key) || 'null'); } catch { /* Optional local cache. */ }
    if (local) { this.preferences = normalizePreferences(local.preferences); this.pending = Boolean(local.pending); }
    if (!this.pending) {
      try {
        const r = await fetch('/api/settings', { cache:'no-store', signal:AbortSignal.timeout(12000) });
        if (r.ok) this.preferences = normalizePreferences((await r.json() as {preferences:unknown}).preferences);
      } catch { /* Keep account-scoped cached preferences. */ }
    }
    this.persist(); this.emit();
    window.addEventListener('online', () => { if (this.pending) void this.save(this.preferences); });
    if (this.pending) void this.save(this.preferences);
  }
  private persist() { try { localStorage.setItem(this.key, JSON.stringify({preferences:this.preferences,pending:this.pending})); } catch { /* Cloud save still available. */ } }
  async save(value: Preferences) {
    this.preferences = normalizePreferences(value); this.pending = true; this.persist(); this.emit();
    const snapshot = this.preferences;
    try {
      const r = await fetch('/api/settings', {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({preferences:snapshot}),signal:AbortSignal.timeout(15000)});
      if (!r.ok) throw new Error('Settings could not reach the cloud. They are kept on this device and will retry when you reconnect.');
      if (this.preferences === snapshot) this.pending = false;
      this.persist(); return true;
    } catch { return false; }
  }
}
export const settingsService = new SettingsService();
