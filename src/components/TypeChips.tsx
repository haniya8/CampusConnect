import { useState } from 'react';
import { Check, List } from 'lucide-react';
import { Button, Chip, Sheet } from './ui';

const VISIBLE = 4;

/**
 * Shows the first few types as chips and puts the rest in a scrollable list,
 * so newly added types do not clutter the screen.
 */
export function TypeChips({
  names, selected, onToggle, multi = false,
}: { names: string[]; selected: string[]; onToggle: (name: string) => void; multi?: boolean }) {
  const [open, setOpen] = useState(false);
  const shown = names.slice(0, VISIBLE);
  const extraSelected = selected.filter((s) => names.includes(s) && !shown.includes(s));
  const chips = [...shown, ...extraSelected];
  const hasMore = names.length > chips.length || names.length > VISIBLE;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {chips.map((n) => <Chip key={n} selected={selected.includes(n)} onClick={() => onToggle(n)}>{n}</Chip>)}
        {hasMore && (
          <button type="button" onClick={() => setOpen(true)}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-grape bg-lav px-4 font-semibold">
            <List size={16} aria-hidden /> All types ({names.length})
          </button>
        )}
      </div>
      <Sheet open={open} title="All types" onClose={() => setOpen(false)}>
        <ul className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
          {names.map((n) => {
            const on = selected.includes(n);
            return (
              <li key={n}>
                <button type="button" aria-pressed={on}
                  onClick={() => { onToggle(n); if (!multi) setOpen(false); }}
                  className={`flex min-h-[48px] w-full items-center justify-between rounded-2xl border-2 px-4 text-left font-semibold ${on ? 'border-grape bg-lav' : 'border-line bg-card'}`}>
                  {n}{on && <Check size={18} aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
        <Button full className="mt-3" onClick={() => setOpen(false)}>Done</Button>
      </Sheet>
    </>
  );
}
