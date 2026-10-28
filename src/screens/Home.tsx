import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Plus, Star } from 'lucide-react';
import { useStore } from '../store';
import { GAME_LAYER } from '../config';
import { PersonAvatar } from '../components/Person';
import { ActivityCard } from '../components/ActivityCard';
import { Button, Card, Empty, Screen, Tag } from '../components/ui';
import { filterActivities, emptyFilters, isLive } from '../logic/activity';
import { levelFor } from '../logic/points';
import { PLACES_NOTE } from '../config';

export function Home() {
  const user = useStore((s) => s.user)!;
  const activities = useStore((s) => s.activities);
  const blocked = useStore((s) => s.blocked);
  const notifications = useStore((s) => s.notifications);
  const points = useStore((s) => s.points);
  const now = useStore((s) => s.now);
  const nav = useNavigate();
  const unread = notifications.filter((n) => !n.read).length;

  const plans = useMemo(() => {
    const mine = activities.filter((a) => a.participants.includes('me') && a.status !== 'Done');
    const live = mine.filter(isLive).sort((a, b) => a.startsAt - b.startsAt);
    const cancelled = mine.filter((a) => a.status === 'Cancelled').slice(0, 2);
    return [...live, ...cancelled];
  }, [activities]);

  const open = useMemo(() => {
    const list = filterActivities(activities, emptyFilters, now, blocked).filter(
      (a) => !a.participants.includes('me') && a.participants.length < a.max,
    );
    const pref = (t: string) => (user.prefs.types.includes(t) ? 0 : 1);
    return list.sort((a, b) => pref(a.type) - pref(b.type) || a.startsAt - b.startsAt).slice(0, 3);
  }, [activities, blocked, now, user.prefs.types]);

  return (
    <Screen>
      <div className="flex items-center gap-3 pb-3 pt-5">
        <button onClick={() => nav(GAME_LAYER ? '/avatar' : '/me')} aria-label={GAME_LAYER ? 'Edit your avatar' : 'Open your profile'} className="flex flex-col items-center">
          <PersonAvatar student={{ id: 'me', nickname: user.nickname, avatar: user.avatar }} size={56} />
          {GAME_LAYER && <span className="text-xs font-bold underline">Edit avatar</span>}
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold">Hi, {user.nickname}!</h1>
          {GAME_LAYER && (
            <Tag cls="bg-butter"><Star size={14} aria-hidden /> {points} points · Level {levelFor(points).index}</Tag>
          )}
        </div>
        <Link to="/notifications" className="relative flex min-h-[44px] min-w-[56px] flex-col items-center rounded-2xl bg-lav px-2 py-1 text-xs font-bold">
          <Bell size={22} aria-hidden />
          Alerts
          {unread > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-grape px-1.5 text-xs text-white">{unread} new</span>}
        </Link>
      </div>

      <Button full icon={<Plus size={20} aria-hidden />} onClick={() => nav('/create')}>Create an activity</Button>

      <h2 className="mb-2 mt-6 text-xl font-extrabold">Your plans</h2>
      {plans.length === 0 ? (
        <Empty title="No plans yet">
          <p className="mb-3">Join something below or make your own.</p>
        </Empty>
      ) : (
        <div className="space-y-3">{plans.map((a) => <ActivityCard key={a.id} a={a} />)}</div>
      )}

      <h2 className="mb-2 mt-6 text-xl font-extrabold">Open for you</h2>
      {open.length === 0 ? (
        <Empty title="Nothing open right now">Try creating one!</Empty>
      ) : (
        <div className="space-y-3">{open.map((a) => <ActivityCard key={a.id} a={a} />)}</div>
      )}
      <div className="mt-3 text-center">
        <Link to="/find" className="inline-flex min-h-[44px] items-center font-bold text-grapedark underline">See all activities</Link>
      </div>
      <Card tone="sky" className="mt-4 text-sm font-semibold">{PLACES_NOTE}</Card>
    </Screen>
  );
}
