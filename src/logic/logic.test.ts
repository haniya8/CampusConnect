import { describe, expect, it } from 'vitest';
import { emailError, isValidUniEmail, nicknameError } from './validation';
import {
  applyCancel,
  applyJoin,
  applyLeave,
  applyReschedule,
  chatOpen,
  computeStatus,
  emptyFilters,
  filterActivities,
  HOUR,
  joinCheck,
  joinBlockText,
  processDeadline,
  validateCreate,
} from './activity';
import { isMutualYes, outcomeFor, preferredPartners, type Answers } from './playAgain';
import { activityKey, awardOnce, levelFor } from './points';
import type { Activity, CreateInput } from '../types';

const NOW = new Date(2026, 9, 27, 12, 0).getTime();
const nick = (id: string) => id.toUpperCase();
const noBlocks = { byUser: [], ofUser: [] };

function act(p: Partial<Activity> = {}): Activity {
  return {
    id: 'a1', type: 'Badminton', title: 'Rally', startsAt: NOW + 3 * HOUR, place: 'Library', level: 'Any',
    kind: 'one', hostId: 'host', participants: ['host'], max: 2, min: 2, audience: 'general',
    status: 'Unconfirmed', withdrawn: [], createdAt: NOW, ...p,
  };
}
const group = (p: Partial<Activity> = {}) =>
  act({ kind: 'group', max: 8, min: 4, rsvpDeadline: NOW + HOUR, participants: ['host', 'a', 'b'], ...p });

describe('validation', () => {
  it('accepts only @khi.iba.edu.pk', () => {
    expect(isValidUniEmail('ali@khi.iba.edu.pk')).toBe(true);
    expect(isValidUniEmail('ALI@KHI.IBA.EDU.PK')).toBe(true);
    expect(isValidUniEmail('ali@iba.edu.pk')).toBe(false);
    expect(isValidUniEmail('ali@sub.khi.iba.edu.pk')).toBe(false);
    expect(isValidUniEmail('ali@khi.iba.edu.pk.evil.com')).toBe(false);
    expect(isValidUniEmail('ali@gmail.com')).toBe(false);
    expect(isValidUniEmail('@khi.iba.edu.pk')).toBe(false);
    expect(emailError('')).toBeTruthy();
    expect(emailError('x@khi.iba.edu.pk')).toBeNull();
  });
  it('checks nicknames', () => {
    expect(nicknameError('Mo')).toBeTruthy();
    expect(nicknameError('A'.repeat(17))).toBeTruthy();
    expect(nicknameError('12345')).toBeTruthy();
    expect(nicknameError('a_b!')).toBeTruthy();
    expect(nicknameError('Sky 22')).toBeNull();
    expect(nicknameError('Mango', ['mango'])).toBeTruthy();
  });
});

describe('states', () => {
  it('one-to-one confirms when a second person joins', () => {
    const { activity, notices } = applyJoin(act(), 'x', nick);
    expect(activity.status).toBe('Confirmed');
    expect(notices.some((n) => n.kind === 'confirmed')).toBe(true);
    expect(notices.some((n) => n.kind === 'joined' && n.to.includes('host'))).toBe(true);
  });
  it('group confirms at the minimum', () => {
    const g = group();
    expect(computeStatus(g)).toBe('Unconfirmed');
    expect(applyJoin(g, 'c', nick).activity.status).toBe('Confirmed');
  });
  it('withdrawing returns to Unconfirmed and notifies the host', () => {
    const confirmed = applyJoin(act(), 'x', nick).activity;
    const { activity, notices } = applyLeave(confirmed, 'x', nick);
    expect(activity.status).toBe('Unconfirmed');
    expect(notices.find((n) => n.kind === 'withdrew')?.to).toEqual(['host']);
    expect(notices.some((n) => n.kind === 'unconfirmed')).toBe(true);
  });
  it('host cannot leave', () => {
    expect(applyLeave(act(), 'host', nick).activity.participants).toEqual(['host']);
  });
  it('cancels at the deadline when below minimum and tells everyone', () => {
    const g = group({ rsvpDeadline: NOW - 1 });
    const { activity, notices } = processDeadline(g, NOW);
    expect(activity.status).toBe('Cancelled');
    expect(notices[0].to).toEqual(['host', 'a', 'b']);
  });
  it('does not cancel when minimum reached or deadline not passed', () => {
    expect(processDeadline(group({ rsvpDeadline: NOW + 1 }), NOW).activity.status).toBe('Unconfirmed');
    const ok = group({ rsvpDeadline: NOW - 1, participants: ['host', 'a', 'b', 'c'], status: 'Confirmed' });
    expect(processDeadline(ok, NOW).activity.status).toBe('Confirmed');
  });
  it('host cancel and reschedule notify participants', () => {
    const g = group();
    const c = applyCancel(g, 'Rain', 'host');
    expect(c.activity.status).toBe('Cancelled');
    expect(c.notices[0].to).toEqual(['a', 'b']);
    expect(c.notices[0].text).toContain('Rain');
    const r = applyReschedule(g, NOW + 5 * HOUR, 'host', NOW);
    expect(r.activity.startsAt).toBe(NOW + 5 * HOUR);
    expect(r.notices[0].kind).toBe('rescheduled');
    expect(r.activity.rsvpDeadline!).toBeLessThan(r.activity.startsAt);
  });
  it('chat opens only when Confirmed', () => {
    expect(chatOpen({ status: 'Confirmed' })).toBe(true);
    for (const s of ['Unconfirmed', 'Done', 'Cancelled'] as const) expect(chatOpen({ status: s })).toBe(false);
  });
});

describe('joining rules', () => {
  it('allows a normal join', () => {
    expect(joinCheck(act(), 'me', [], noBlocks, NOW)).toBeNull();
  });
  it('blocks double join, full, overlap, blocks either way, past', () => {
    expect(joinCheck(act({ participants: ['host', 'me'] }), 'me', [], noBlocks, NOW)).toBe('already');
    expect(joinCheck(act({ participants: ['host', 'z'], status: 'Confirmed' }), 'me', [], noBlocks, NOW)).toBe('full');
    const other = act({ id: 'o', participants: ['me', 'q'], startsAt: NOW + 3 * HOUR + 30 * 60_000 });
    expect(joinCheck(act(), 'me', [other], noBlocks, NOW)).toBe('overlap');
    const far = act({ id: 'o', participants: ['me', 'q'], startsAt: NOW + 6 * HOUR });
    expect(joinCheck(act(), 'me', [far], noBlocks, NOW)).toBeNull();
    expect(joinCheck(act(), 'me', [], { byUser: ['host'], ofUser: [] }, NOW)).toBe('blocked');
    expect(joinCheck(act(), 'me', [], { byUser: [], ofUser: ['host'] }, NOW)).toBe('blocked');
    expect(joinCheck(act({ startsAt: NOW - 1 }), 'me', [], noBlocks, NOW)).toBe('closed');
    expect(joinCheck(act({ status: 'Cancelled' }), 'me', [], noBlocks, NOW)).toBe('closed');
  });
  it('uses the exact label for no spots', () => {
    expect(joinBlockText.full).toBe('No spots left on this one');
  });
});

describe('create validation', () => {
  const base: CreateInput = {
    type: 'Badminton', title: '', startsAt: NOW + 2 * HOUR, place: 'Library', level: 'Any', kind: 'one',
    max: 2, min: 2, audience: 'general',
  };
  const ctx = { now: NOW, mine: [] as Activity[], joinedCommunities: ['lit'] };
  it('passes a valid plan', () => expect(validateCreate(base, ctx)).toEqual({}));
  it('requires future time and a place', () => {
    expect(validateCreate({ ...base, startsAt: NOW - 1 }, ctx).time).toBeTruthy();
    expect(validateCreate({ ...base, startsAt: NaN }, ctx).time).toBeTruthy();
    expect(validateCreate({ ...base, place: '  ' }, ctx).place).toBeTruthy();
  });
  it('checks group limits, minimum and deadline', () => {
    const g: CreateInput = { ...base, kind: 'group', max: 8, min: 4, rsvpDeadline: NOW + HOUR };
    expect(validateCreate(g, ctx)).toEqual({});
    expect(validateCreate({ ...g, max: 2 }, ctx).max).toBeTruthy();
    expect(validateCreate({ ...g, max: 13 }, ctx).max).toBeTruthy();
    expect(validateCreate({ ...g, min: 9 }, ctx).min).toBeTruthy();
    expect(validateCreate({ ...g, rsvpDeadline: NOW + 3 * HOUR }, ctx).deadline).toBeTruthy();
    expect(validateCreate({ ...g, rsvpDeadline: undefined }, ctx).deadline).toBeTruthy();
  });
  it('requires a joined community', () => {
    expect(validateCreate({ ...base, audience: 'both', communityId: 'lit' }, ctx)).toEqual({});
    expect(validateCreate({ ...base, audience: 'both', communityId: 'x' }, ctx).audience).toBeTruthy();
  });
});

describe('filters', () => {
  it('filters by type, around-time and level, and hides blocked hosts', () => {
    const three = new Date(2026, 9, 28, 15, 0).getTime();
    const list = [
      act({ id: '1', startsAt: three, level: 'Beginner' }),
      act({ id: '2', startsAt: three + 3 * HOUR, level: 'Advanced' }),
      act({ id: '3', startsAt: three, type: 'Reading', hostId: 'bad', level: 'Advanced' }),
    ];
    const f = { ...emptyFilters, around: '15:00', level: 'Beginner' as const };
    expect(filterActivities(list, f, NOW, []).map((a) => a.id)).toEqual(['1']);
    expect(filterActivities(list, { ...emptyFilters, type: 'Reading' }, NOW, ['bad'])).toEqual([]);
  });
});

describe('play again privacy', () => {
  const base: Answers = { g: { me: { them: 'yes' } } };
  it('matches only when both said yes', () => {
    expect(isMutualYes({ g: { me: { them: 'yes' }, them: { me: 'yes' } } }, 'g', 'me', 'them')).toBe(true);
    expect(isMutualYes(base, 'g', 'me', 'them')).toBe(false);
  });
  it('"no" and "no answer" give identical results', () => {
    const withNo: Answers = { g: { me: { them: 'yes' }, them: { me: 'no' } } };
    const noAnswer: Answers = { g: { me: { them: 'yes' } } };
    expect(outcomeFor(withNo, 'g', 'me', ['them', 'x'])).toEqual(outcomeFor(noAnswer, 'g', 'me', ['them', 'x']));
    expect(preferredPartners(withNo, 'me')).toEqual(preferredPartners(noAnswer, 'me'));
  });
  it('outcome exposes nothing but matches', () => {
    const out = outcomeFor({ g: { me: { a: 'yes', b: 'no' }, a: { me: 'yes' }, b: { me: 'yes' } } }, 'g', 'me', ['a', 'b']);
    expect(Object.keys(out)).toEqual(['matches']);
    expect(out.matches).toEqual(['a']);
  });
});

describe('points', () => {
  it('awards once per key', () => {
    const first = awardOnce([], activityKey('a1'), 10);
    expect(first.gained).toBe(10);
    expect(awardOnce(first.ledger, activityKey('a1'), 10).gained).toBe(0);
  });
  it('computes levels', () => {
    expect(levelFor(0).name).toBe('Newcomer');
    expect(levelFor(25).index).toBe(2);
  });
});
