import type {
  Activity,
  ActivityLevel,
  BlockLists,
  CreateInput,
  Level,
  Notice,
  Status,
} from '../types';
import { activityTitle, fmtWhen, minutesOfDay, startOfDay, DAY } from './format';

export const HOUR = 3_600_000;
export const MIN_GROUP = 3;
export const MAX_GROUP = 12;

export type JoinBlock = 'closed' | 'already' | 'full' | 'blocked' | 'overlap';
type Nick = (id: string) => string;

export function computeStatus(a: Pick<Activity, 'status' | 'participants' | 'min'>): Status {
  if (a.status === 'Done' || a.status === 'Cancelled') return a.status;
  return a.participants.length >= a.min ? 'Confirmed' : 'Unconfirmed';
}

export const spotsLeft = (a: Pick<Activity, 'max' | 'participants'>) =>
  Math.max(0, a.max - a.participants.length);

export const neededToConfirm = (a: Pick<Activity, 'min' | 'participants'>) =>
  Math.max(0, a.min - a.participants.length);

export const timesOverlap = (a: number, b: number, len = HOUR) => Math.abs(a - b) < len;

/** Chat opens only when the plan is Confirmed. */
export const chatOpen = (a: Pick<Activity, 'status'>) => a.status === 'Confirmed';

export const isLive = (a: Pick<Activity, 'status'>) =>
  a.status === 'Unconfirmed' || a.status === 'Confirmed';

export function isBlockedPair(blocks: BlockLists, ids: string[]): boolean {
  return ids.some((i) => blocks.byUser.includes(i) || blocks.ofUser.includes(i));
}

export function joinCheck(
  a: Activity,
  userId: string,
  all: Activity[],
  blocks: BlockLists,
  now: number,
): JoinBlock | null {
  if (!isLive(a) || a.startsAt <= now) return 'closed';
  if (a.kind === 'group' && a.status === 'Unconfirmed' && a.rsvpDeadline !== undefined && a.rsvpDeadline <= now)
    return 'closed';
  if (a.participants.includes(userId)) return 'already';
  if (spotsLeft(a) === 0) return 'full';
  if (isBlockedPair(blocks, [a.hostId, ...a.participants])) return 'blocked';
  const clash = all.some(
    (o) => o.id !== a.id && isLive(o) && o.participants.includes(userId) && timesOverlap(o.startsAt, a.startsAt),
  );
  if (clash) return 'overlap';
  return null;
}

export const joinBlockText: Record<JoinBlock, string> = {
  closed: 'This plan has ended.',
  already: "You're already in this plan.",
  full: 'No spots left on this one',
  blocked: "You can't join this one.",
  overlap: 'You already have a plan at this time.',
};

export function applyJoin(a: Activity, userId: string, nick: Nick): { activity: Activity; notices: Notice[] } {
  const participants = [...a.participants, userId];
  const activity: Activity = {
    ...a,
    participants,
    withdrawn: a.withdrawn.filter((x) => x !== userId),
  };
  activity.status = computeStatus(activity);
  const notices: Notice[] = [];
  const t = activityTitle(a);
  if (userId !== a.hostId)
    notices.push({ kind: 'joined', to: [a.hostId], text: `${nick(userId)} joined "${t}".`, activityId: a.id });
  if (a.status !== 'Confirmed' && activity.status === 'Confirmed')
    notices.push({ kind: 'confirmed', to: participants, text: `"${t}" is confirmed.`, activityId: a.id });
  return { activity, notices };
}

export function applyLeave(a: Activity, userId: string, nick: Nick): { activity: Activity; notices: Notice[] } {
  if (userId === a.hostId || !a.participants.includes(userId) || !isLive(a)) return { activity: a, notices: [] };
  const participants = a.participants.filter((p) => p !== userId);
  const activity: Activity = { ...a, participants, withdrawn: [...a.withdrawn, userId] };
  activity.status = computeStatus(activity);
  const t = activityTitle(a);
  const notices: Notice[] = [
    { kind: 'withdrew', to: [a.hostId], text: `${nick(userId)} withdrew from "${t}".`, activityId: a.id },
  ];
  if (a.status === 'Confirmed' && activity.status === 'Unconfirmed')
    notices.push({
      kind: 'unconfirmed',
      to: participants,
      text: `"${t}" is no longer confirmed. It needs ${neededToConfirm(activity)} more.`,
      activityId: a.id,
    });
  return { activity, notices };
}

export function applyReschedule(
  a: Activity,
  newStart: number,
  hostId: string,
  now: number,
): { activity: Activity; notices: Notice[] } {
  const activity: Activity = { ...a, startsAt: newStart };
  if (a.kind === 'group' && (a.rsvpDeadline === undefined || a.rsvpDeadline >= newStart - 30 * 60_000 || a.rsvpDeadline <= now))
    activity.rsvpDeadline = Math.max(now + 5 * 60_000, newStart - HOUR);
  return {
    activity,
    notices: [
      {
        kind: 'rescheduled',
        to: a.participants.filter((p) => p !== hostId),
        text: `"${activityTitle(a)}" moved to ${fmtWhen(newStart, now)}.`,
        activityId: a.id,
      },
    ],
  };
}

export function applyCancel(
  a: Activity,
  reason: string,
  byUserId: string,
): { activity: Activity; notices: Notice[] } {
  if (!isLive(a)) return { activity: a, notices: [] };
  return {
    activity: { ...a, status: 'Cancelled', cancelReason: reason },
    notices: [
      {
        kind: 'cancelled',
        to: a.participants.filter((p) => p !== byUserId),
        text: `"${activityTitle(a)}" was cancelled. Reason: ${reason}`,
        activityId: a.id,
      },
    ],
  };
}

/** If the RSVP deadline passed below the minimum, cancel and tell everyone who responded. */
export function processDeadline(a: Activity, now: number): { activity: Activity; notices: Notice[] } {
  if (a.kind !== 'group' || a.status !== 'Unconfirmed' || a.rsvpDeadline === undefined || a.rsvpDeadline > now)
    return { activity: a, notices: [] };
  const reason = `fewer than ${a.min} people said yes by the deadline.`;
  return {
    activity: { ...a, status: 'Cancelled', cancelReason: reason[0].toUpperCase() + reason.slice(1) },
    notices: [
      {
        kind: 'cancelled',
        to: [...a.participants],
        text: `"${activityTitle(a)}" was cancelled because ${reason}`,
        activityId: a.id,
      },
    ],
  };
}

export function markDone(a: Activity): Activity {
  return a.status === 'Confirmed' ? { ...a, status: 'Done' } : a;
}

export function buildActivity(input: CreateInput, hostId: string, id: string, now: number): Activity {
  const one = input.kind === 'one';
  const a: Activity = {
    id,
    type: input.type,
    title: input.title.trim(),
    startsAt: input.startsAt,
    place: input.place.trim(),
    level: input.level,
    kind: input.kind,
    hostId,
    participants: [hostId],
    max: one ? 2 : input.max,
    min: one ? 2 : input.min,
    rsvpDeadline: one ? undefined : input.rsvpDeadline,
    audience: input.audience,
    communityId: input.audience === 'general' ? undefined : input.communityId,
    status: 'Unconfirmed',
    withdrawn: [],
    createdAt: now,
  };
  return a;
}

export type CreateErrors = Partial<Record<'type' | 'time' | 'place' | 'title' | 'max' | 'min' | 'deadline' | 'audience', string>>;

export function validateCreate(
  input: CreateInput,
  ctx: { now: number; mine: Activity[]; joinedCommunities: string[] },
): CreateErrors {
  const e: CreateErrors = {};
  if (!input.type.trim()) e.type = 'Pick an activity type.';
  if (!Number.isFinite(input.startsAt)) e.time = 'Pick a date and time.';
  else if (input.startsAt <= ctx.now) e.time = 'Pick a time in the future.';
  else if (ctx.mine.some((o) => isLive(o) && timesOverlap(o.startsAt, input.startsAt)))
    e.time = 'You already have a plan at this time.';
  const place = input.place.trim();
  if (!place) e.place = 'Pick a place or type one.';
  else if (place.length > 40) e.place = 'Keep the place name under 40 characters.';
  if (input.title.trim().length > 40) e.title = 'Keep the title under 40 characters.';
  if (input.kind === 'group') {
    if (!Number.isInteger(input.max) || input.max < MIN_GROUP || input.max > MAX_GROUP)
      e.max = `A group needs ${MIN_GROUP} to ${MAX_GROUP} people.`;
    if (!Number.isInteger(input.min) || input.min < 2 || input.min > input.max)
      e.min = 'The minimum must be at least 2 and not more than the limit.';
    if (input.rsvpDeadline === undefined || !Number.isFinite(input.rsvpDeadline)) e.deadline = 'Pick an RSVP deadline.';
    else if (input.rsvpDeadline <= ctx.now) e.deadline = 'The deadline must be in the future.';
    else if (Number.isFinite(input.startsAt) && input.rsvpDeadline >= input.startsAt)
      e.deadline = 'The deadline must be before the start time.';
  }
  if (input.audience !== 'general') {
    if (!input.communityId) e.audience = 'Pick a community.';
    else if (!ctx.joinedCommunities.includes(input.communityId)) e.audience = 'Join this community first.';
  }
  return e;
}

export interface Filters {
  type: string;
  day: 'any' | 'today' | 'tomorrow';
  around: string;
  level: Level | 'All';
}

export const emptyFilters: Filters = { type: 'All', day: 'any', around: '', level: 'All' };

export function matchesFilters(a: Activity, f: Filters, now: number): boolean {
  if (!isLive(a) || a.startsAt <= now || a.audience === 'community') return false;
  if (f.type !== 'All' && a.type !== f.type) return false;
  if (f.day !== 'any') {
    const diff = Math.round((startOfDay(a.startsAt) - startOfDay(now)) / DAY);
    if (diff !== (f.day === 'today' ? 0 : 1)) return false;
  }
  if (f.around) {
    const [h, m] = f.around.split(':').map(Number);
    if (Math.abs(minutesOfDay(a.startsAt) - (h * 60 + m)) > 60) return false;
  }
  if (f.level !== 'All' && a.level !== f.level && a.level !== 'Any') return false;
  return true;
}

export function filterActivities(list: Activity[], f: Filters, now: number, blocked: string[]): Activity[] {
  return list
    .filter((a) => !blocked.includes(a.hostId) && matchesFilters(a, f, now))
    .sort((x, y) => x.startsAt - y.startsAt);
}

export type { ActivityLevel };
