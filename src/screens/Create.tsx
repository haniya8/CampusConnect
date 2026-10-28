import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useStore } from '../store';
import { TypeChips } from '../components/TypeChips';
import { Button, Chip, Field, inputCls, Screen, TopBar } from '../components/ui';
import { HOUR, MAX_GROUP, MIN_GROUP, validateCreate } from '../logic/activity';
import { fromInputValue, toInputValue } from '../logic/format';
import { PLACES_NOTE } from '../config';
import type { ActivityLevel, Audience, CreateInput, Kind } from '../types';

const OTHER = '__other';

export function Create() {
  const [q] = useSearchParams();
  const s = useStore();
  const nav = useNavigate();
  const from = q.get('from') ? s.activities.find((a) => a.id === q.get('from')) : undefined;

  const defaultTime = q.get('time') ? Number(q.get('time')) : Math.ceil((s.now + HOUR) / HOUR) * HOUR;
  const [type, setType] = useState(from?.type ?? q.get('type') ?? '');
  const [title, setTitle] = useState(from?.title ?? '');
  const [when, setWhen] = useState(toInputValue(defaultTime));
  const [placeSel, setPlaceSel] = useState(from ? (s.places.includes(from.place) ? from.place : OTHER) : '');
  const [placeTxt, setPlaceTxt] = useState(from && !s.places.includes(from.place) ? from.place : '');
  const [level, setLevel] = useState<ActivityLevel>(from?.level ?? (q.get('level') as ActivityLevel) ?? 'Any');
  const [kind, setKind] = useState<Kind>(from?.kind ?? 'one');
  const [max, setMax] = useState(from?.kind === 'group' ? from.max : 6);
  const [min, setMin] = useState(from?.kind === 'group' ? from.min : 3);
  const [deadline, setDeadline] = useState('');
  const [audience, setAudience] = useState<Audience>(from?.audience ?? (q.get('community') ? 'both' : 'general'));
  const [community, setCommunity] = useState(from?.communityId ?? q.get('community') ?? s.joinedCommunities[0] ?? '');
  const [newType, setNewType] = useState(false);
  const [typeName, setTypeName] = useState('');
  const [typeSport, setTypeSport] = useState(false);
  const [errs, setErrs] = useState<ReturnType<typeof validateCreate>>({});

  const startsAt = fromInputValue(when);
  // default deadline: 2 hours before start (only used until the user edits it)
  const deadlineMs = deadline ? fromInputValue(deadline) : startsAt - 2 * HOUR;
  const place = placeSel === OTHER ? placeTxt : placeSel;
  const joined = s.communities.filter((c) => s.joinedCommunities.includes(c.id));

  const addType = () => {
    if (!typeName.trim()) return;
    s.addType(typeName, typeSport);
    setType(typeName.trim());
    setNewType(false);
    setTypeName('');
  };

  const publish = (e: React.FormEvent) => {
    e.preventDefault();
    const input: CreateInput = {
      type, title, startsAt, place, level, kind, max, min,
      rsvpDeadline: kind === 'group' ? deadlineMs : undefined,
      audience, communityId: audience === 'general' ? undefined : community,
    };
    const mine = s.activities.filter((a) => a.participants.includes('me'));
    const er = validateCreate(input, { now: Date.now(), mine, joinedCommunities: s.joinedCommunities });
    setErrs(er);
    if (Object.keys(er).length) return;
    const id = s.createActivity(input);
    nav(`/activity/${id}/joined`, { replace: true });
  };

  return (
    <div>
      <TopBar title="Create an activity" />
      <Screen>
        <form onSubmit={publish} noValidate className="pb-8">
          <Field label="What is it?" error={errs.type}>
            <div className="flex flex-wrap gap-2">
              <TypeChips names={s.types.map((t) => t.name)} selected={[type]} onToggle={setType} />
              <button type="button" onClick={() => setNewType(!newType)} className="inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 border-dashed border-grape px-4 font-semibold">
                <Plus size={16} aria-hidden /> Add new type
              </button>
            </div>
            {newType && (
              <div className="mt-2 space-y-2 rounded-2xl bg-lav p-3">
                <input className={inputCls} placeholder="e.g. Chess" value={typeName} maxLength={20} onChange={(e) => setTypeName(e.target.value)} aria-label="New activity type name" />
                <label className="flex min-h-[44px] items-center gap-2 font-semibold">
                  <input type="checkbox" className="h-5 w-5" checked={typeSport} onChange={(e) => setTypeSport(e.target.checked)} /> This is a sport or active game
                </label>
                <Button type="button" onClick={addType}>Add this type</Button>
              </div>
            )}
          </Field>

          <Field label="Title (optional)" error={errs.title}>
            <input className={inputCls} value={title} maxLength={50} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Easy rally, no pressure" />
          </Field>

          <Field label="Date and time" error={errs.time}>
            <input className={inputCls} type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
          </Field>

          <Field label="Place" error={errs.place} hint={PLACES_NOTE}>
            <select className={inputCls} value={placeSel} onChange={(e) => setPlaceSel(e.target.value)}>
              <option value="">Choose a place…</option>
              {s.places.map((p) => <option key={p} value={p}>{p}</option>)}
              <option value={OTHER}>Other (type it)</option>
            </select>
            {placeSel === OTHER && (
              <input className={`${inputCls} mt-2`} placeholder="Type the place" value={placeTxt} maxLength={50} onChange={(e) => setPlaceTxt(e.target.value)} aria-label="Other place" />
            )}
          </Field>

          <Field label="Preferred level">
            <div className="flex flex-wrap gap-2">
              {(['Beginner', 'Intermediate', 'Advanced', 'Any'] as ActivityLevel[]).map((l) => (
                <Chip key={l} selected={level === l} onClick={() => setLevel(l)}>{l === 'Any' ? 'Any level' : l}</Chip>
              ))}
            </div>
          </Field>

          <Field label="Who can join?">
            <div className="flex flex-wrap gap-2">
              <Chip selected={kind === 'one'} onClick={() => setKind('one')}>One other person</Chip>
              <Chip selected={kind === 'group'} onClick={() => setKind('group')}>A group</Chip>
            </div>
          </Field>

          {kind === 'group' && (
            <div className="mb-4 space-y-1 rounded-3xl bg-peach/60 p-3">
              <Field label={`Limit (${MIN_GROUP} to ${MAX_GROUP} people)`} error={errs.max}>
                <input className={inputCls} type="number" inputMode="numeric" min={MIN_GROUP} max={MAX_GROUP} value={max} onChange={(e) => setMax(Number(e.target.value))} />
              </Field>
              <Field label="Minimum people to confirm" hint="You count as one person." error={errs.min}>
                <input className={inputCls} type="number" inputMode="numeric" min={2} max={max} value={min} onChange={(e) => setMin(Number(e.target.value))} />
              </Field>
              <Field label="RSVP deadline" hint="If fewer than the minimum say yes by then, the plan is cancelled." error={errs.deadline}>
                <input className={inputCls} type="datetime-local" value={deadline || toInputValue(deadlineMs || defaultTime)} onChange={(e) => setDeadline(e.target.value)} />
              </Field>
            </div>
          )}

          <Field label="Where will it show?" error={errs.audience}>
            <div className="flex flex-wrap gap-2">
              <Chip selected={audience === 'general'} onClick={() => setAudience('general')}>General list</Chip>
              <Chip selected={audience === 'community'} onClick={() => setAudience('community')}>One community only</Chip>
              <Chip selected={audience === 'both'} onClick={() => setAudience('both')}>Community and general list</Chip>
            </div>
            {audience !== 'general' &&
              (joined.length ? (
                <select className={`${inputCls} mt-2`} value={community} onChange={(e) => setCommunity(e.target.value)} aria-label="Community">
                  {joined.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              ) : (
                <p className="mt-2 rounded-2xl bg-butter p-3 font-semibold">You have not joined a community yet. Join one in the Groups tab first, or pick General list.</p>
              ))}
          </Field>

          <Button type="submit" full>Publish activity</Button>
        </form>
      </Screen>
    </div>
  );
}
