export const FONT_OPTIONS = [
  { label: 'Gill Sans', value: '"Gill Sans", "Gill Sans MT", Calibri, sans-serif' },
  { label: 'System', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Trebuchet', value: '"Trebuchet MS", Arial, sans-serif' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Georgia', value: 'Georgia, "Times New Roman", serif' },
];
export const COMMANDS = [
  { id: 'addChild', label: 'Create child branch', key: 'Enter' },
  { id: 'addSibling', label: 'Create sibling branch', key: 'Tab' },
  { id: 'edit', label: 'Edit selected idea', key: 'F2' },
  { id: 'delete', label: 'Delete selected branch', key: 'Backspace' },
  { id: 'collapse', label: 'Expand / collapse branch', key: 'Mod+.' },
  { id: 'undo', label: 'Undo', key: 'Mod+z' },
  { id: 'redo', label: 'Redo', key: 'Mod+Shift+z' },
  { id: 'fit', label: 'Fit map to screen', key: 'Shift+1' },
  { id: 'search', label: 'Search ideas / outline', key: 'Mod+f' },
  { id: 'focus', label: 'Toggle focus view', key: 'Mod+Shift+f' },
  { id: 'save', label: 'Save to cloud now', key: 'Mod+s' },
  { id: 'help', label: 'Show keyboard shortcuts', key: '?' },
  { id: 'settings', label: 'Open settings', key: 'Mod+,' },
  { id: 'contextMenu', label: 'Open context menu', key: 'Shift+F10' },
  { id: 'pan', label: 'Hold to pan canvas', key: 'Space' },
] as const;
export type CommandId = typeof COMMANDS[number]['id'];
export type Preferences = { fontFamily: string; spelling: boolean; shortcuts: Record<CommandId, string> };
export const DEFAULT_PREFERENCES: Preferences = { fontFamily: FONT_OPTIONS[0].value, spelling: true, shortcuts: Object.fromEntries(COMMANDS.map(c => [c.id, c.key])) as Preferences['shortcuts'] };
export function normalizePreferences(value: unknown): Preferences {
  const v = value && typeof value === 'object' ? value as Partial<Preferences> : {};
  const shortcuts = { ...DEFAULT_PREFERENCES.shortcuts };
  for (const c of COMMANDS) if (typeof v.shortcuts?.[c.id] === 'string' && v.shortcuts[c.id].length <= 40) shortcuts[c.id] = v.shortcuts[c.id];
  return { fontFamily: typeof v.fontFamily === 'string' && v.fontFamily.trim() && v.fontFamily.length <= 200 ? v.fontFamily : DEFAULT_PREFERENCES.fontFamily, spelling: typeof v.spelling === 'boolean' ? v.spelling : true, shortcuts };
}
export function shortcutFromEvent(e: Pick<KeyboardEvent, 'key'|'code'|'shiftKey'|'metaKey'|'ctrlKey'|'altKey'>): string {
  if (['Shift','Control','Alt','Meta'].includes(e.key)) return '';
  let key = e.key === ' ' ? 'Space' : e.key.length === 1 ? e.key.toLowerCase() : e.key;
  // Keep number-row shortcuts stable across keyboard layouts and shifted punctuation.
  if (e.shiftKey && /^Digit[0-9]$/.test(e.code) && e.key !== '?') key = e.code.slice(5);
  const parts = [e.metaKey || e.ctrlKey ? 'Mod' : '', e.altKey ? 'Alt' : '', e.shiftKey && (key.length > 1 || /[a-z0-9]/.test(key)) ? 'Shift' : '', key];
  return parts.filter(Boolean).join('+');
}
export function commandForEvent(e: KeyboardEvent, preferences: Preferences): CommandId | undefined {
  const key = shortcutFromEvent(e);
  return COMMANDS.find(c => preferences.shortcuts[c.id] && preferences.shortcuts[c.id] === key)?.id;
}
export function shortcutLabel(shortcut: string): string {
  if (!shortcut) return 'Not assigned';
  const mac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
  return shortcut.replace('Mod+', mac ? '⌘ ' : 'Ctrl + ').replace('Shift+', mac ? '⇧ ' : 'Shift + ').replace('Alt+', mac ? '⌥ ' : 'Alt + ').replace('Space','Space');
}
