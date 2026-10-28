import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CalendarClock, CheckCircle2, Clock, Flag, MapPin, MessageCircle, Signal, Sparkles, XCircle } from 'lucide-react';
import { useStore } from '../store';
import { Button, Card, Field, inputCls, ProgressBar, Screen, Sheet, StatusTag, Tag, TopBar } from '../components/ui';
import { Person } from '../components/Person';
import { spotsText, typeTone } from '../components/ActivityCard';
import { chatOpen, isLive, joinBlockText, joinCheck, neededToConfirm, spotsLeft } from '../logic/activity';
import { activityTitle, fmtWhen, fromInputValue, toInputValue } from '../logic/format';
import { statusSummary } from '../logic/describe';
import { CANCEL_REASONS } from '../seed';
import { GAME_LAYER, PLACES_NOTE } from '../config';

export function ActivityPage() {
  const { id } = useParams();
  const s = useStore();
  const nav = useNavigate();
  const a = s.activities.find((x) => x.id === id);
  const [sheet, setSheet] = useState<null | 'leave' | 'cancel' | 'resched' | 'done'>(null);
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const [newWhen, setNewWhen] = useState('');
  const [err, setErr] = useState('');

  if (!a) return (<div><TopBar title="Not found" /><Screen><p>We could not find this plan.</p></Screen></div>);

  const mine = a.participants.includes('me');
  const host = a.hostId === 'me';
  const sum = statusSummary(a, s.now);
  const check = joinCheck(a, 'me', s.activities, { byUser: s.blocked, ofUser: [] }, s.now);
  const visible = a.participants.filter((p) => !s.blocked.includes(p));
  const banner = {
    Unconfirmed: { cls: 'bg-butter', icon: <Clock aria-hidden /> },
    Confirmed: { cls: 'bg-mint', icon: <CheckCircle2 aria-hidden /> },
    Done: { cls: 'bg-sky', icon: <Flag aria-hidden /> },
    Cancelled: { cls: 'bg-rose', icon: <XCircle aria-hidden /> },
  }[a.status];
  const sport = s.types.find((t) => t.name === a.type)?.sport ?? false;

  const join = () => {
    const r = s.joinActivity(a.id);
    if (r.ok) nav(`/activity/${a.id}/joined`);
  };

  const reschedule = () => {
    const t = fromInputValue(newWhen);
    if (!Number.isFinite(t) || t <= Date.now()) return setErr('Pick a time in the future.');
    s.rescheduleActivity(a.id, t);
    setSheet(null);
    setErr('');
  };

  return (
    <div>
      <TopBar title="Activity" />
      <Screen>
        <div role="status" className={`mb-4 flex gap-3 rounded-3xl p-4 ${banner.cls}`}>
          <span className="mt-0.5">{banner.icon}</span>
          <div>
            <p className="text-lg font-extrabold">{sum.headline}</p>
            <p className="font-semibold">{sum.detail}</p>
          </div>
        </div>

        <div className="mb-2 flex flex-wrap gap-2"><Tag cls={typeTone(a.type)}>{a.type}</Tag><StatusTag status={a.status} /></div>
        <h2 className="text-2xl font-extrabold">{activityTitle(a)}</h2>
        <ul className="my-3 space-y-2">
          <li className="flex items-center gap-2"><Clock size={18} aria-hidden /> {fmtWhen(a.startsAt, s.now)}</li>
          <li className="flex items-center gap-2"><MapPin size={18} aria-hidden /> {a.place}</li>
          <li className="flex items-center gap-2"><Signal size={18} aria-hidden /> Level: {a.level === 'Any' ? 'Any level' : a.level}</li>
          <li className="font-semibold">{a.kind === 'one' ? 'One-to-one' : `Group of up to ${a.max}`} · {spotsText(a)}</li>
        </ul>
        <p className="mb-4 rounded-2xl bg-sky p-3 text-sm font-semibold">{PLACES_NOTE}</p>

        {a.kind === 'group' && isLive(a) && (
          <Card className="mb-4">
            <ProgressBar value={Math.min(a.participants.length, a.min)} max={a.min}
              label={a.status === 'Confirmed' ? `${a.participants.length} going. Minimum of ${a.min} reached.` : `${a.participants.length} of ${a.min} needed to confirm`} />
            {a.rsvpDeadline && a.status === 'Unconfirmed' && <p className="mt-2 text-sm">RSVP deadline: {fmtWhen(a.rsvpDeadline, s.now)}</p>}
          </Card>
        )}

        <h3 className="mb-1 text-lg font-extrabold">Who is going ({a.participants.length})</h3>
        <Card className="mb-4 flex flex-col gap-1">
          {visible.map((p) => (
            <Person key={p} id={p} suffix={p === a.hostId ? <Tag cls="bg-peach">Host</Tag> : undefined} />
          ))}
          {a.kind === 'group' && spotsLeft(a) > 0 && isLive(a) && <p className="text-sm text-soft">{spotsLeft(a)} spots open</p>}
        </Card>

        {!mine && isLive(a) && (
          <div className="mb-4">
            <Button full disabled={!!check} onClick={join}>
              {check ? joinBlockText[check] : a.kind === 'one' ? 'Join this plan' : "RSVP: I'm going"}
            </Button>
            {check === 'overlap' && <p className="mt-1 text-sm font-semibold">Check "Your plans" on Home to see what clashes.</p>}
          </div>
        )}

        {mine && !host && isLive(a) && (
          <Button full variant="secondary" className="mb-4" onClick={() => setSheet('leave')}>
            {a.kind === 'one' ? 'Leave this plan' : 'Withdraw my RSVP'}
          </Button>
        )}

        {host && isLive(a) && (
          <Card tone="peach" className="mb-4">
            <h3 className="mb-2 text-lg font-extrabold">Host actions</h3>
            {a.status === 'Unconfirmed' && a.startsAt <= s.now && <p className="mb-2 font-semibold">Nobody joined in time. You can pick a new time or cancel.</p>}
            <div className="flex flex-col gap-2">
              <Button variant="secondary" icon={<CalendarClock size={18} aria-hidden />} onClick={() => { setNewWhen(toInputValue(Math.max(a.startsAt, s.now) + 3_600_000)); setSheet('resched'); }}>Reschedule</Button>
              <Button variant="danger" onClick={() => setSheet('cancel')}>Cancel this plan</Button>
            </div>
          </Card>
        )}

        {host && a.status === 'Cancelled' && (
          <Button full className="mb-4" onClick={() => nav(`/create?from=${a.id}`)}>Propose a different time</Button>
        )}

        {mine && isLive(a) && (
          <Card tone="mint" className="mb-4">
            <h3 className="mb-2 text-lg font-extrabold">On the day</h3>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" icon={<MessageCircle size={18} aria-hidden />} onClick={() => nav(`/activity/${a.id}/chat`)}>
                {chatOpen(a) ? 'Open chat' : 'Chat (not open yet)'}
              </Button>
              {GAME_LAYER && a.status === 'Confirmed' && (
                <Button variant="secondary" icon={<Sparkles size={18} aria-hidden />} onClick={() => nav(`/activity/${a.id}/twist`)}>
                  Optional twist: {sport ? 'rally challenge' : 'talk prompts'}
                </Button>
              )}
              {a.status === 'Confirmed' && <Button icon={<Flag size={18} aria-hidden />} onClick={() => setSheet('done')}>We're done</Button>}
            </div>
          </Card>
        )}

        {a.status === 'Done' && mine && (
          <Button full variant="secondary" className="mb-4" onClick={() => nav(`/activity/${a.id}/after`)}>
            {GAME_LAYER ? 'Play again? (private)' : 'Follow or message'}
          </Button>
        )}
        {a.status === 'Cancelled' && <Link to="/find" className="block text-center font-bold underline">Find another activity</Link>}

        <Sheet open={sheet === 'leave'} title={a.kind === 'one' ? 'Leave this plan?' : 'Withdraw your RSVP?'} onClose={() => setSheet(null)}>
          <p className="mb-4">The host will be told{a.status === 'Confirmed' ? ', and the plan may no longer be confirmed' : ''}.</p>
          <div className="space-y-2">
            <Button full variant="danger" onClick={() => { s.leaveActivity(a.id); setSheet(null); }}>Yes, leave</Button>
            <Button full variant="secondary" onClick={() => setSheet(null)}>Stay in</Button>
          </div>
        </Sheet>
        <Sheet open={sheet === 'cancel'} title="Cancel this plan?" onClose={() => setSheet(null)}>
          <Field label="Reason (everyone will see it)">
            <select className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)}>
              {CANCEL_REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <div className="space-y-2">
            <Button full variant="danger" onClick={() => { s.cancelActivity(a.id, reason); setSheet(null); }}>Yes, cancel the plan</Button>
            <Button full variant="secondary" onClick={() => setSheet(null)}>Keep the plan</Button>
          </div>
        </Sheet>
        <Sheet open={sheet === 'resched'} title="Pick a new time" onClose={() => setSheet(null)}>
          <Field label="New date and time" error={err}>
            <input type="datetime-local" className={inputCls} value={newWhen} onChange={(e) => setNewWhen(e.target.value)} />
          </Field>
          <p className="mb-3 text-sm">Everyone in the plan will be told about the new time.</p>
          <div className="space-y-2">
            <Button full onClick={reschedule}>Save new time</Button>
            <Button full variant="secondary" onClick={() => setSheet(null)}>Cancel</Button>
          </div>
        </Sheet>
        <Sheet open={sheet === 'done'} title="Mark this as finished?" onClose={() => setSheet(null)}>
          <p className="mb-4">This closes the plan and moves it to your history.</p>
          <div className="space-y-2">
            <Button full onClick={() => { s.finishActivity(a.id); setSheet(null); nav(`/activity/${a.id}/after`); }}>Yes, we're done</Button>
            <Button full variant="secondary" onClick={() => setSheet(null)}>Not yet</Button>
          </div>
        </Sheet>
      </Screen>
    </div>
  );
}

export function Joined() {
  const { id } = useParams();
  const s = useStore();
  const nav = useNavigate();
  const a = s.activities.find((x) => x.id === id);
  if (!a) return null;
  const host = a.hostId === 'me';
  const confirmed = a.status === 'Confirmed';
  const need = neededToConfirm(a);
  return (
    <div>
      <TopBar title={host ? 'Plan published' : 'Joined'} to={`/activity/${a.id}`} />
      <Screen>
        <div className={`animate-pop rounded-3xl p-6 text-center ${confirmed ? 'bg-mint' : 'bg-butter'}`}>
          {confirmed ? <CheckCircle2 size={56} className="mx-auto" aria-hidden /> : <Clock size={56} className="mx-auto" aria-hidden />}
          <h2 className="mt-2 text-2xl font-extrabold">{confirmed ? 'Confirmed!' : "You're on the list"}</h2>
          <p className="mt-2 font-semibold">{activityTitle(a)}</p>
          <p>{fmtWhen(a.startsAt, s.now)} · {a.place}</p>
          {!confirmed && (
            <p className="mt-3 text-left font-semibold">
              {a.kind === 'one'
                ? host ? 'Your plan is live. It is confirmed when 1 more person joins. We will tell you.' : 'It is confirmed when the other person is in.'
                : `This plan needs at least ${a.min} people. Now ${a.participants.length} said yes, ${need} more needed by ${a.rsvpDeadline ? fmtWhen(a.rsvpDeadline, s.now) : 'the start'}. If not enough people say yes by then, it is cancelled and we tell everyone.`}
            </p>
          )}
          {confirmed && <p className="mt-2 font-semibold">You can now chat with the others.</p>}
        </div>
        <p className="my-3 rounded-2xl bg-sky p-3 text-sm font-semibold">{PLACES_NOTE}</p>
        <div className="space-y-2">
          <Button full onClick={() => nav(`/activity/${a.id}`, { replace: true })}>View the plan</Button>
          {confirmed && <Button full variant="secondary" onClick={() => nav(`/activity/${a.id}/chat`)}>Open chat</Button>}
          <Button full variant="ghost" onClick={() => nav('/', { replace: true })}>Back to Home</Button>
        </div>
      </Screen>
    </div>
  );
}
