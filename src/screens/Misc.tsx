import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Bell, Check, History as HistoryIcon, ShieldOff } from 'lucide-react';
import { useStore } from '../store';
import { Button, Card, Empty, Screen, Sheet, Tag, TopBar } from '../components/ui';
import { Person, PersonAvatar } from '../components/Person';
import { ActivityCard } from '../components/ActivityCard';
import { fmtWhen, activityTitle } from '../logic/format';
import { preferredPartners } from '../logic/playAgain';
import { levelFor } from '../logic/points';
import { REPORT_REASONS } from '../seed';
import { GAME_LAYER } from '../config';

export function History() {
  const activities = useStore((s) => s.activities);
  const answers = useStore((s) => s.answers);
  const blocked = useStore((s) => s.blocked);
  const nav = useNavigate();
  const now = useStore((s) => s.now);
  const done = activities.filter((a) => a.status === 'Done' && a.participants.includes('me')).sort((a, b) => b.startsAt - a.startsAt);
  const partners = preferredPartners(answers, 'me');
  return (
    <div>
      <TopBar title="History" />
      <Screen>
        {done.length === 0 && <Empty title="No finished activities yet">They will show here after you mark them as done.</Empty>}
        <div className="space-y-3">
          {done.map((a) => (
            <Card key={a.id}>
              <Link to={`/activity/${a.id}`} className="block">
                <p className="text-lg font-extrabold">{activityTitle(a)}</p>
                <p className="text-soft">{a.type} · {fmtWhen(a.startsAt, now)} · {a.place}</p>
              </Link>
              <div className="mt-2 flex flex-col">
                {a.participants.filter((p) => p !== 'me' && !blocked.includes(p)).map((p) => (
                  <Person key={p} id={p} suffix={GAME_LAYER && partners.includes(p) && answers[a.id]?.me?.[p] === 'yes' && answers[a.id]?.[p]?.me === 'yes' ? <Tag cls="bg-butter">Preferred partner</Tag> : undefined} />
                ))}
              </div>
              {!answers[a.id]?.me && (
                <Button variant="secondary" className="mt-2" onClick={() => nav(`/activity/${a.id}/after`)}>{GAME_LAYER ? 'Answer "play again?"' : 'Follow or message'}</Button>
              )}
            </Card>
          ))}
        </div>
      </Screen>
    </div>
  );
}

export function Notifications() {
  const list = useStore((s) => s.notifications);
  const markAll = useStore((s) => s.markAllRead);
  const now = useStore((s) => s.now);
  const nav = useNavigate();
  const label: Record<string, string> = {
    joined: 'Someone joined', withdrew: 'Someone withdrew', confirmed: 'Plan confirmed', unconfirmed: 'No longer confirmed',
    rescheduled: 'Time changed', cancelled: 'Cancelled', info: 'Info',
  };
  return (
    <div>
      <TopBar title="Alerts" to="/" right={<Button variant="secondary" onClick={markAll}>Mark all read</Button>} />
      <Screen>
        {list.length === 0 && <Empty title="No alerts yet" />}
        <div className="space-y-3">
          {list.map((n) => (
            <button key={n.id} onClick={() => n.activityId && nav(`/activity/${n.activityId}`)} className={`block w-full rounded-3xl border-2 border-line p-4 text-left ${n.read ? 'bg-card' : 'bg-lav'}`}>
              <span className="mb-1 flex items-center gap-2 text-sm font-bold"><Bell size={16} aria-hidden /> {label[n.kind]}{!n.read && <Tag cls="bg-white">New</Tag>} <span className="ml-auto font-semibold text-soft">{fmtWhen(n.at, now)}</span></span>
              <span className="font-semibold">{n.text}</span>
            </button>
          ))}
        </div>
      </Screen>
    </div>
  );
}

export function StudentPage() {
  const { id } = useParams();
  const st = useStore((s) => s.students.find((x) => x.id === id));
  const blocked = useStore((s) => s.blocked);
  const answers = useStore((s) => s.answers);
  const nav = useNavigate();
  if (!st) return null;
  const pref = GAME_LAYER && preferredPartners(answers, 'me').includes(st.id);
  return (
    <div>
      <TopBar title={st.nickname} />
      <Screen>
        <Card className="flex flex-col items-center gap-2 text-center">
          <PersonAvatar student={st} size={120} />
          <h2 className="text-2xl font-extrabold">{st.nickname}</h2>
          <Tag cls="bg-sky">Usual level: {st.level}</Tag>
          {pref && <Tag cls="bg-butter">Preferred partner</Tag>}
          {blocked.includes(st.id) && <Tag cls="bg-rose">Blocked</Tag>}
        </Card>
        <Button full variant="danger" icon={<ShieldOff size={18} aria-hidden />} className="mt-4" onClick={() => nav(`/report/${st.id}`)}>Report or block</Button>
      </Screen>
    </div>
  );
}

export function Report() {
  const { id } = useParams();
  const st = useStore((s) => s.students.find((x) => x.id === id));
  const { report, block } = useStore();
  const nav = useNavigate();
  const [reason, setReason] = useState('');
  const [sheet, setSheet] = useState<null | 'report' | 'block'>(null);
  const [err, setErr] = useState('');
  if (!st) return null;
  const ask = (k: 'report' | 'block') => (reason ? (setErr(''), setSheet(k)) : setErr('Choose a reason first.'));
  const confirm = () => {
    if (sheet === 'report') report(st.id, reason);
    else block(st.id);
    nav(`/report/${st.id}/done?action=${sheet}`, { replace: true });
  };
  return (
    <div>
      <TopBar title={`Report or block ${st.nickname}`} />
      <Screen>
        <fieldset className="mb-3">
          <legend className="mb-2 font-bold">Why?</legend>
          <div className="space-y-2">
            {REPORT_REASONS.map((r) => (
              <label key={r} className={`flex min-h-[48px] items-center gap-3 rounded-2xl border-2 px-4 font-semibold ${reason === r ? 'border-grape bg-lav' : 'border-line bg-card'}`}>
                <input type="radio" name="reason" className="h-5 w-5" checked={reason === r} onChange={() => setReason(r)} /> {r}
              </label>
            ))}
          </div>
          {err && <p role="alert" className="mt-2 font-bold text-[#A3204F]">{err}</p>}
        </fieldset>
        <div className="space-y-2">
          <Button full variant="danger" onClick={() => ask('report')}>Report {st.nickname}</Button>
          <Button full variant="danger" onClick={() => ask('block')}>Block {st.nickname}</Button>
        </div>
        <Sheet open={!!sheet} title={sheet === 'report' ? `Report ${st.nickname}?` : `Block ${st.nickname}?`} onClose={() => setSheet(null)}>
          <p className="mb-4">
            {sheet === 'report' ? `We will record: "${reason}". ${st.nickname} will not be told who reported.` : `You will not see ${st.nickname}'s plans or messages, and you cannot join each other's plans. You can undo this any time.`}
          </p>
          <div className="space-y-2">
            <Button full onClick={confirm}>Yes, {sheet === 'report' ? 'report' : 'block'}</Button>
            <Button full variant="secondary" onClick={() => setSheet(null)}>No, go back</Button>
          </div>
        </Sheet>
      </Screen>
    </div>
  );
}

export function ReportDone() {
  const { id } = useParams();
  const [q] = useSearchParams();
  const st = useStore((s) => s.students.find((x) => x.id === id));
  const blocked = useStore((s) => s.blocked);
  const unblock = useStore((s) => s.unblock);
  const nav = useNavigate();
  if (!st) return null;
  const isBlock = q.get('action') === 'block';
  return (
    <div>
      <TopBar title="Done" to="/" />
      <Screen>
        <Card tone="mint" className="text-center">
          <Check size={48} className="mx-auto" aria-hidden />
          <h2 className="mt-2 text-xl font-extrabold">{isBlock ? `${st.nickname} is ${blocked.includes(st.id) ? 'blocked' : 'unblocked'}` : 'Thanks for telling us'}</h2>
          <p>{isBlock ? (blocked.includes(st.id) ? 'You will no longer see them.' : 'Their plans will show again.') : 'We have your report. You can also block this person if you want.'}</p>
        </Card>
        <div className="mt-4 space-y-2">
          {isBlock && blocked.includes(st.id) && <Button full variant="secondary" onClick={() => unblock(st.id)}>Undo block</Button>}
          {!isBlock && !blocked.includes(st.id) && <Button full variant="secondary" onClick={() => nav(`/report/${st.id}`, { replace: true })}>Block {st.nickname}</Button>}
          <Button full onClick={() => nav('/', { replace: true })}>Back to Home</Button>
        </div>
      </Screen>
    </div>
  );
}

export function Me() {
  const user = useStore((s) => s.user)!;
  const points = useStore((s) => s.points);
  const blocked = useStore((s) => s.blocked);
  const students = useStore((s) => s.students);
  const unblock = useStore((s) => s.unblock);
  const s = { signOut: useStore((st) => st.signOut) };
  const [signOut, setSignOut] = useState(false);
  const nav = useNavigate();
  const lv = levelFor(points);
  return (
    <Screen>
      <div className="flex flex-col items-center gap-2 pb-4 pt-6">
        <PersonAvatar student={{ id: 'me', nickname: user.nickname, avatar: user.avatar }} size={110} />
        <h1 className="text-2xl font-extrabold">{user.nickname}</h1>
        {GAME_LAYER && <Tag cls="bg-butter">{points} points · Level {lv.index}: {lv.name}</Tag>}
      </div>
      <div className="space-y-2">
        {GAME_LAYER && <Button full variant="secondary" onClick={() => nav('/avatar')}>Edit avatar</Button>}
        <Button full variant="secondary" onClick={() => nav('/prefs')}>Edit preferences</Button>
        <Button full variant="secondary" icon={<HistoryIcon size={18} aria-hidden />} onClick={() => nav('/history')}>History</Button>
        <Button full variant="secondary" onClick={() => nav('/notifications')}>Alerts</Button>
        <Button full variant="secondary" onClick={() => nav('/demo')}>Demo tools</Button>
      </div>
      <Button full variant="danger" className="mt-2" onClick={() => setSignOut(true)}>Sign out</Button>
      <Sheet open={signOut} title="Sign out?" onClose={() => setSignOut(false)}>
        <p className="mb-4">Your plans, points, chats and blocks on this device will be removed. You can sign up again with a new nickname.</p>
        <div className="space-y-2">
          <Button full variant="danger" onClick={() => { s.signOut(); nav('/welcome', { replace: true }); }}>Yes, sign out</Button>
          <Button full variant="secondary" onClick={() => setSignOut(false)}>Stay signed in</Button>
        </div>
      </Sheet>
      <h2 className="mb-2 mt-6 text-xl font-extrabold">Blocked people</h2>
      {blocked.length === 0 ? <p className="text-soft">You have not blocked anyone.</p> : (
        <div className="space-y-2">
          {blocked.map((b) => {
            const st = students.find((x) => x.id === b);
            return st ? (
              <Card key={b} className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold"><PersonAvatar student={st} size={32} /> {st.nickname}</span>
                <Button variant="secondary" onClick={() => unblock(b)}>Unblock</Button>
              </Card>
            ) : null;
          })}
        </div>
      )}
    </Screen>
  );
}

export function Demo() {
  const s = useStore();
  const mine = s.activities.filter((a) => a.hostId === 'me' || a.participants.includes('me')).filter((a) => a.status === 'Unconfirmed' || a.status === 'Confirmed');
  return (
    <div>
      <TopBar title="Demo tools" />
      <Screen>
        <Card tone="butter" className="mb-4">
          <p className="font-semibold">For testing the scenarios without a server.</p>
          <p className="mt-1 text-sm">GAME_LAYER is currently <b>{String(GAME_LAYER)}</b> (change it in src/config.ts).</p>
        </Card>
        <label className="mb-4 flex min-h-[48px] items-center gap-3 rounded-2xl border-2 border-line bg-card px-4 font-bold">
          <input type="checkbox" className="h-5 w-5" checked={s.simAuto} onChange={(e) => s.setSimAuto(e.target.checked)} />
          Simulated students join my plans
        </label>
        <h2 className="mb-2 font-extrabold">My active plans</h2>
        {mine.length === 0 && <p className="text-soft">None yet.</p>}
        <div className="space-y-3">
          {mine.map((a) => (
            <Card key={a.id}>
              <ActivityCard a={a} />
              <div className="mt-2 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => s.demoInvite(a.id)}>Add a student now</Button>
                <Button variant="secondary" onClick={() => s.demoWithdraw(a.id)}>{a.hostId === 'me' ? 'Someone withdraws' : 'Host cancels'}</Button>
                {a.kind === 'group' && <Button variant="secondary" onClick={() => s.demoExpireDeadline(a.id)}>RSVP deadline passes</Button>}
                <Button variant="secondary" onClick={() => s.demoTimePasses(a.id)}>Planned time passes</Button>
              </div>
            </Card>
          ))}
        </div>
        <Button full variant="danger" className="mt-6" onClick={() => confirm('Clear everything and start over?') && s.resetAll()}>Reset all data</Button>
      </Screen>
    </div>
  );
}
