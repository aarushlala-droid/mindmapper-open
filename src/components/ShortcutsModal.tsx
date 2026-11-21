import { Dialog } from './Dialog';
import { COMMANDS, shortcutLabel } from '../services/preferences';
import { settingsService } from '../services/settings';
export function ShortcutsModal({isOpen,onClose}:{isOpen:boolean;onClose:()=>void}) {
  if(!isOpen)return null;
  return <Dialog title="A few useful shortcuts" description="Change any shortcut in Settings → Keyboard controls." onClose={onClose}><div className="settings-body shortcut-settings">{COMMANDS.map(c=><div key={c.id}><span>{c.label}</span><kbd className="shortcut-recorder">{shortcutLabel(settingsService.preferences.shortcuts[c.id])}</kbd></div>)}<p className="settings-note">Double-click an idea to edit. Shift+Enter adds a new line. Drag the background to pan, and pinch or use Ctrl+wheel to zoom. Text fields use your device’s native spelling and autocorrect.</p></div></Dialog>;
}
