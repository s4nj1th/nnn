'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useUIStore } from '@/store/ui-store';
import { getModifierKey } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const mod = typeof window !== 'undefined' ? getModifierKey() : 'Ctrl';

const shortcutGroups = [
  {
    title: 'General',
    shortcuts: [
      { key: `${mod} S`, description: 'Save project' },
      { key: `${mod} Z`, description: 'Undo' },
      { key: `${mod} ⇧ Z`, description: 'Redo' },
      { key: '?', description: 'Show shortcuts' },
    ],
  },
  {
    title: 'Canvas',
    shortcuts: [
      { key: `${mod} +`, description: 'Zoom in' },
      { key: `${mod} -`, description: 'Zoom out' },
      { key: 'F', description: 'Fit view' },
      { key: 'Space', description: 'Pan mode' },
      { key: 'Shift + Drag', description: 'Multi-select' },
    ],
  },
  {
    title: 'Nodes',
    shortcuts: [
      { key: 'Double click', description: 'Edit node' },
      { key: 'Delete / ⌫', description: 'Delete selected' },
      { key: `${mod} C`, description: 'Copy selected' },
      { key: `${mod} V`, description: 'Paste' },
      { key: `${mod} D`, description: 'Duplicate' },
    ],
  },
  {
    title: 'Simulation',
    shortcuts: [
      { key: 'P', description: 'Run / Pause simulation' },
      { key: 'R', description: 'Reset simulation' },
      { key: '→', description: 'Step forward' },
    ],
  },
];

export function ShortcutsModal() {
  const { isShortcutsModalOpen, setShortcutsModal } = useUIStore();

  return (
    <Dialog open={isShortcutsModalOpen} onOpenChange={setShortcutsModal}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {shortcutGroups.map((group, i) => (
            <div key={group.title}>
              {i > 0 && <Separator className="mb-5" />}
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((shortcut) => (
                  <div key={shortcut.key} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{shortcut.description}</span>
                    <kbd className="rounded-md bg-secondary border border-border px-2 py-1 text-xs font-mono text-foreground shadow-sm">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
