import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useStore } from '../store';
import { ActivityCard } from '../components/ActivityCard';
import { TypeChips } from '../components/TypeChips';
import { Button, Card, Chip, Empty, Screen } from '../components/ui';
import { emptyFilters, filterActivities, type Filters } from '../logic/activity';
import { startOfDay } from '../logic/format';
import { PLACES_NOTE } from '../config';
import type { Level } from '../types';

export function Find() {
  const activities = useStore((s) => s.activities);
  const types = useStore((s) => s.types);
  const blocked = useStore((s) => s.blocked);
  const now = useStore((s) => s.now);
  const nav = useNavigate();
  const [f, setF] = useState<Filters>(emptyFilters);
  const list = useMemo(() => filterActivities(activities, f, now, blocked), [activities, f, now, blocked]);

  const createWithFilters = () => {
    const q = new URLSearchParams();
    if (f.type !== 'All') q.set('type', f.type);
    if (f.level !== 'All') q.set('level', f.level);
    if (f.around || f.day !== 'any') {
      const [h, m] = (f.around || '15:00').split(':').map(Number);
      let t = startOfDay(now) + (f.day === 'tomorrow' ? 86_400_000 : 0) + (h * 60 + m) * 60_000;
      if (t <= now) t += 86_400_000;
      q.set('time', String(t));
    }
    nav(`/create?${q.toString()}`);
  };

  return (
    <Screen>
      <h1 className="pb-3 pt-5 text-2xl font-extrabold">Find activities</h1>
      <Card className="mb-4 space-y-3">
        <fieldset>
          <legend className="mb-1 font-bold">Type</legend>
          <TypeChips names={['All', ...types.map((t) => t.name)]} selected={[f.type]} onToggle={(t) => setF({ ...f, type: t })} />
        </fieldset>
        <fieldset>
          <legend className="mb-1 font-bold">Day</legend>
          <div className="flex flex-wrap gap-2">
            {([['any', 'Any day'], ['today', 'Today'], ['tomorrow', 'Tomorrow']] as const).map(([v, l]) => (
              <Chip key={v} selected={f.day === v} onClick={() => setF({ ...f, day: v })}>{l}</Chip>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="around" className="mb-1 block font-bold">Around what time?</label>
          <div className="flex items-center gap-2">
            <input id="around" type="time" value={f.around} onChange={(e) => setF({ ...f, around: e.target.value })}
              className="min-h-[48px] flex-1 rounded-2xl border-2 border-line bg-card px-4" />
            {f.around && <Button variant="secondary" onClick={() => setF({ ...f, around: '' })}>Clear time</Button>}
          </div>
          <p className="mt-1 text-sm text-soft">Shows plans within 1 hour of this time.</p>
        </div>
        <fieldset>
          <legend className="mb-1 font-bold">Level</legend>
          <div className="flex flex-wrap gap-2">
            {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((l) => (
              <Chip key={l} selected={f.level === l} onClick={() => setF({ ...f, level: l as Level | 'All' })}>{l === 'All' ? 'Any level' : l}</Chip>
            ))}
          </div>
        </fieldset>
      </Card>

      <p className="mb-2 font-semibold" aria-live="polite">{list.length} {list.length === 1 ? 'activity' : 'activities'} found</p>
      {list.length === 0 ? (
        <Empty title="Nothing matches these filters">
          <p className="mb-3">No problem. You can create your own plan. We fill in your filters for you.</p>
          <Button full icon={<Plus size={18} aria-hidden />} onClick={createWithFilters}>Create this activity</Button>
        </Empty>
      ) : (
        <div className="space-y-3">{list.map((a) => <ActivityCard key={a.id} a={a} />)}</div>
      )}
      {list.length > 0 && (
        <Button full variant="secondary" className="mt-4" onClick={createWithFilters}>Create my own activity</Button>
      )}
      <p className="mt-4 rounded-2xl bg-sky p-3 text-sm font-semibold">{PLACES_NOTE}</p>
    </Screen>
  );
}
