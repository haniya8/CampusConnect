import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Check, Heart, Mail, MailOpen, MessageCircle, UserPlus, X } from 'lucide-react';
import { useStore } from '../store';
import { Button, Card, Screen, Tag, TopBar } from '../components/ui';
import { Person } from '../components/Person';
import { GAME_LAYER } from '../config';
import { outcomeFor, type Answer } from '../logic/playAgain';
import { activityTitle } from '../logic/format';

function others(participants: string[], blocked: string[]) {
  return participants.filter((p) => p !== 'me' && !blocked.includes(p));
}

export function After() {
  const { id } = useParams();
  const a = useStore((s) => s.activities.find((x) => x.id === id));
  const blocked = useStore((s) => s.blocked);
  const submit = useStore((s) => s.submitPlayAgain);
  const followed = useStore((s) => s.followed);
  const toggleFollow = useStore((s) => s.toggleFollow);
  const gained = useStore((s) => s.gained);
  const nav = useNavigate();
  const [picks, setPicks] = useState<Record<string, Answer>>({});
  if (!a) return <Navigate to="/" replace />;
  const list = others(a.participants, blocked);

  if (!GAME_LAYER)
    return (
      <div>
        <TopBar title="Nice one!" to="/" />
        <Screen>
          <p className="mb-3 text-lg font-bold">{activityTitle(a)} is finished.</p>
          <div className="space-y-3">
            {list.map((p) => (
              <Card key={p} className="flex flex-wrap items-center justify-between gap-2">
                <Person id={p} />
                <div className="flex gap-2">
                  <Button variant={followed.includes(p) ? 'primary' : 'secondary'} aria-pressed={followed.includes(p)} icon={<UserPlus size={18} aria-hidden />} onClick={() => toggleFollow(p)}>
                    {followed.includes(p) ? 'Following' : 'Follow'}
                  </Button>
                  <Button variant="secondary" icon={<MessageCircle size={18} aria-hidden />} onClick={() => nav(`/dm/${p}`)}>Message</Button>
                </div>
              </Card>
            ))}
          </div>
          <Button full className="mt-5" onClick={() => nav('/', { replace: true })}>Done</Button>
        </Screen>
      </div>
    );

  const send = () => {
    submit(a.id, picks);
    nav(`/activity/${a.id}/result`, { replace: true });
  };

  return (
    <div>
      <TopBar title="Play again?" to="/" />
      <Screen>
        {gained > 0 && <Tag cls="bg-butter">+{gained} points for finishing</Tag>}
        <h2 className="mt-2 text-xl font-extrabold">How was {activityTitle(a)}?</h2>
        <p className="mb-4 flex items-start gap-2 rounded-2xl bg-sky p-3 font-semibold">
          <Mail size={20} className="mt-0.5 shrink-0" aria-hidden />
          Your answers are private. You only see a match if you both say yes.
        </p>
        <div className="space-y-3">
          {list.map((p) => (
            <Card key={p}>
              <Person id={p} link={false} />
              <div className="mt-2 grid grid-cols-2 gap-2">
                {([['yes', 'Yes, play again', Check], ['no', 'Not this time', X]] as const).map(([v, label, Icon]) => (
                  <button key={v} type="button" aria-pressed={picks[p] === v} onClick={() => setPicks({ ...picks, [p]: v })}
                    className={`flex min-h-[52px] items-center justify-center gap-1 rounded-2xl border-2 px-2 font-bold ${picks[p] === v ? 'border-grape bg-lav' : 'border-line bg-card'}`}>
                    <Icon size={18} aria-hidden /> {label}
                  </button>
                ))}
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-5 space-y-2">
          <Button full onClick={send}>Send privately</Button>
          <Button full variant="ghost" onClick={() => nav('/', { replace: true })}>Skip for now</Button>
        </div>
      </Screen>
    </div>
  );
}

export function Result() {
  const { id } = useParams();
  const a = useStore((s) => s.activities.find((x) => x.id === id));
  const answers = useStore((s) => s.answers);
  const blocked = useStore((s) => s.blocked);
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 2600);
    return () => clearTimeout(t);
  }, []);
  if (!a || !GAME_LAYER) return <Navigate to="/" replace />;
  const { matches } = outcomeFor(answers, a.id, 'me', others(a.participants, blocked));

  return (
    <div>
      <TopBar title="Your result" to="/" />
      <Screen>
        {!open ? (
          <div className="py-12 text-center" aria-live="polite">
            <Mail size={96} className="mx-auto animate-wiggle text-grape" aria-hidden />
            <p className="mt-4 text-lg font-bold">Sealing your answers…</p>
          </div>
        ) : matches.length > 0 ? (
          <Card tone="rose" className="animate-pop text-center">
            <Heart size={56} className="mx-auto" aria-hidden />
            <h2 className="my-2 text-2xl font-extrabold">It's a match!</h2>
            <p className="mb-3">You both want to play again.</p>
            <div className="flex flex-col items-center">{matches.map((m) => <Person key={m} id={m} size={56} />)}</div>
            <Tag cls="bg-butter">Preferred partner</Tag>
          </Card>
        ) : (
          <Card tone="lav" className="animate-pop text-center">
            <MailOpen size={56} className="mx-auto" aria-hidden />
            <h2 className="my-2 text-2xl font-extrabold">Thanks for playing!</h2>
            <p>We hope you enjoyed it. Keep exploring to meet more people.</p>
          </Card>
        )}
        <Button full className="mt-5" onClick={() => nav('/', { replace: true })}>Back to Home</Button>
      </Screen>
    </div>
  );
}
