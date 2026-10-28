import { Link } from 'react-router-dom';
import { GAME_LAYER } from '../config';
import { Avatar } from '../avatar/Avatar';
import { personOf, useStore } from '../store';
import type { Student } from '../types';

const INITIAL_COLORS = ['#F4978E', '#7FCFAF', '#7FB5EA', '#B39DEB', '#F2CB5F', '#EE8FB4'];

export function PersonAvatar({ student, size = 40 }: { student: Pick<Student, 'id' | 'nickname' | 'avatar'>; size?: number }) {
  if (GAME_LAYER) return <Avatar spec={student.avatar} size={size} label={`${student.nickname}'s avatar`} />;
  let h = 0;
  for (const c of student.id) h = (h * 31 + c.charCodeAt(0)) % 997;
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full font-extrabold text-ink"
      style={{ width: size, height: size, background: INITIAL_COLORS[h % INITIAL_COLORS.length], fontSize: size * 0.45 }}
    >
      {student.nickname[0]?.toUpperCase()}
    </span>
  );
}

/** Avatar + nickname. Optionally links to the person's page. */
export function Person({ id, size = 40, link = true, suffix }: { id: string; size?: number; link?: boolean; suffix?: React.ReactNode }) {
  const user = useStore((s) => s.user);
  const students = useStore((s) => s.students);
  const p = personOf({ user, students }, id);
  if (!p) return null;
  const body = (
    <span className="inline-flex items-center gap-2">
      <PersonAvatar student={p} size={size} />
      <span className="font-bold">{p.nickname}{id === 'me' ? ' (you)' : ''}</span>
      {suffix}
    </span>
  );
  return link && id !== 'me' ? (
    <Link to={`/student/${id}`} className="inline-flex min-h-[44px] items-center">{body}</Link>
  ) : (
    <span className="inline-flex min-h-[44px] items-center">{body}</span>
  );
}
