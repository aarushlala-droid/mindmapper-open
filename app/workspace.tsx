'use client';
import { useEffect, useState, type ComponentType } from 'react';
export default function Workspace({ userId }: { userId: string }) {
  const [Editor, setEditor] = useState<ComponentType | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { storageService } = await import('../src/services/storage');
        const { settingsService } = await import('../src/services/settings');
        const {folderService}=await import('../src/services/folders');
        await Promise.all([storageService.initialize(userId), settingsService.initialize(userId), folderService.initialize(userId)]);
        const { default: App } = await import('../src/App');
        if (mounted) setEditor(() => App);
      } catch (e) { if (mounted) setError(e instanceof Error ? e.message : 'Please try again.'); }
    }
    void load();
    return () => { mounted = false; };
  }, [userId]);
  if (Editor) return <Editor />;
  return <main className="boot-screen"><div className="brand-mark">m</div><h1>{error ? 'Your workspace could not open' : 'Opening your workspace'}</h1><p>{error || 'Loading your saved maps…'}</p>{error && <button className="primary-button" onClick={() => location.reload()}>Try again</button>}</main>;
}
