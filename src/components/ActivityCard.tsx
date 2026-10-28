import { Link } from 'react-router-dom';
import { Clock, MapPin, Signal, Users } from 'lucide-react';
import type { Activity } from '../types';
import { activityTitle, fmtWhen } from '../logic/format';
import { spotsLeft } from '../logic/activity';
import { StatusTag, Tag } from './ui';
import { useStore } from '../store';
import { Person } from './Person';

export const typeTone = (t: string) =>
  t === 'Badminton' ? 'bg-mint' : t === 'Table tennis' ? 'bg-sky' : t === 'Reading' ? 'bg-lav' : 'bg-peach';

export function spotsText(a: Activity): string {
  const left = spotsLeft(a);
  if (a.status === 'Done') return `${a.participants.length} took part`;
  if (a.status === 'Cancelled') return `${a.participants.length} had said yes`;
  if (left === 0) return 'No spots left on this one';
  return `${left} ${left === 1 ? 'spot' : 'spots'} left`;
}

export function ActivityCard({ a }: { a: Activity }) {
  const now = useStore((s) => s.now);
  const mine = a.participants.includes('me');
  return (
    <Link to={`/activity/${a.id}`} className="block rounded-3xl border-2 border-line bg-card p-4 active:scale-[.99]">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Tag cls={typeTone(a.type)}>{a.type}</Tag>
        <StatusTag status={a.status} />
        {mine && <Tag cls="bg-peach">{a.hostId === 'me' ? "You're hosting" : "You're in"}</Tag>}
      </div>
      <p className="text-lg font-extrabold">{activityTitle(a)}</p>
      <ul className="mt-1 space-y-1 text-[15px]">
        <li className="flex items-center gap-2"><Clock size={16} aria-hidden /> {fmtWhen(a.startsAt, now)}</li>
        <li className="flex items-center gap-2"><MapPin size={16} aria-hidden /> {a.place}</li>
        <li className="flex items-center gap-2"><Signal size={16} aria-hidden /> Level: {a.level === 'Any' ? 'Any level' : a.level}</li>
        <li className="flex items-center gap-2"><Users size={16} aria-hidden /> {spotsText(a)}</li>
      </ul>
      <div className="mt-2 text-sm text-soft">
        Host: <Person id={a.hostId} size={24} link={false} />
      </div>
    </Link>
  );
}
