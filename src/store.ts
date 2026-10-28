import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GAME_LAYER, SIM_DELAY_MS } from './config';
import {
  ACTIVITY_TYPES, CANNED_REPLIES, COMMUNITIES, PLACES, QUESTS, SEED_ANSWERS, STUDENTS, WELCOME_NOTE,
  buildActivities, buildThreads,
} from './seed';
import type {
  Activity, ActivityType, AppNotification, AvatarSpec, ChatMsg, Community, CreateInput, Level, Notice,
  Student, Thread, User,
} from './types';
import {
  computeStatus, applyCancel, applyJoin, applyLeave, applyReschedule, buildActivity, chatOpen, isLive, joinCheck,
  markDone as markDonePure, processDeadline, type JoinBlock,
} from './logic/activity';
import { emailError, nicknameError } from './logic/validation';
import { activityKey, awardOnce, POINTS, questKey, twistKey } from './logic/points';
import type { Answer, Answers } from './logic/playAgain';
import { randomAvatar } from './avatar/parts';
import { activityTitle } from './logic/format';

const uid = () => Math.random().toString(36).slice(2, 9);
const KEY = 'campusconnect-v1';

export interface State {
  now: number;
  user: User | null;
  students: Student[];
  types: ActivityType[];
  places: string[];
  activities: Activity[];
  communities: Community[];
  joinedCommunities: string[];
  threads: Thread[];
  chats: Record<string, ChatMsg[]>;
  notifications: AppNotification[];
  answers: Answers;
  points: number;
  ledger: string[];
  questsDone: string[];
  blocked: string[];
  reports: { studentId: string; reason: string; at: number }[];
  followed: string[];
  simAuto: boolean;
  gained: number;

  signUp(nickname: string, email: string): { nickname?: string; email?: string } | null;
  savePrefs(p: User['prefs']): void;
  saveAvatar(a: AvatarSpec): void;
  addType(name: string, sport: boolean): void;
  createActivity(input: CreateInput): string;
  joinActivity(id: string): { ok: true } | { ok: false; reason: JoinBlock };
  leaveActivity(id: string): void;
  rescheduleActivity(id: string, startsAt: number): void;
  cancelActivity(id: string, reason: string): void;
  sendMessage(key: string, text: string, replyFrom?: string): void;
  finishActivity(id: string): void;
  submitPlayAgain(activityId: string, picks: Record<string, Answer>): void;
  completeTwist(id: string): void;
  completeQuest(id: string): void;
  joinCommunity(id: string): void;
  addThread(communityId: string, title: string, body: string): string;
  addReply(threadId: string, text: string): void;
  markAllRead(): void;
  block(id: string): void;
  unblock(id: string): void;
  report(id: string, reason: string): void;
  toggleFollow(id: string): void;
  tick(): void;
  resumeSims(): void;
  setSimAuto(v: boolean): void;
  demoExpireDeadline(id: string): void;
  demoTimePasses(id: string): void;
  demoWithdraw(id: string): void;
  demoInvite(id: string): void;
  signOut(): void;
  resetAll(): void;
}

function initial() {
  const now = Date.now();
  return {
    now,
    user: null as User | null,
    students: STUDENTS,
    types: ACTIVITY_TYPES,
    places: PLACES,
    activities: buildActivities(now),
    communities: COMMUNITIES,
    joinedCommunities: [] as string[],
    threads: buildThreads(now),
    chats: {} as Record<string, ChatMsg[]>,
    notifications: [{ id: 'n0', kind: 'info' as const, text: WELCOME_NOTE, at: now, read: false }] as AppNotification[],
    answers: SEED_ANSWERS,
    points: 0,
    ledger: [] as string[],
    questsDone: [] as string[],
    blocked: [] as string[],
    reports: [] as { studentId: string; reason: string; at: number }[],
    followed: [] as string[],
    simAuto: true,
    gained: 0,
  };
}

export const useStore = create<State>()(
  persist(
    (set, get) => {
      const nick = (id: string) =>
        id === 'me' ? get().user?.nickname ?? 'You' : get().students.find((s) => s.id === id)?.nickname ?? 'Someone';

      const withNotices = (list: AppNotification[], notices: Notice[]): AppNotification[] => {
        const mine = notices.filter((n) => n.to.includes('me'));
        const at = Date.now();
        return [
          ...mine.map((n) => ({ id: uid(), kind: n.kind, text: n.text, activityId: n.activityId, at, read: false })),
          ...list,
        ];
      };

      const replaceActivity = (a: Activity, notices: Notice[]) =>
        set((s) => ({
          activities: s.activities.map((x) => (x.id === a.id ? a : x)),
          notifications: withNotices(s.notifications, notices),
        }));

      const later = (fn: () => void, ms = SIM_DELAY_MS) => setTimeout(fn, ms);

      const simJoinStep = (id: string) => {
        const s = get();
        if (!s.simAuto) return;
        const a = s.activities.find((x) => x.id === id);
        if (!a || !isLive(a) || !a.participants.includes('me')) return;
        const target = a.kind === 'one' ? 2 : Math.min(a.max, a.min + 1);
        if (a.participants.length >= target) return;
        const candidates = s.students.filter(
          (st) => !a.participants.includes(st.id) && !s.blocked.includes(st.id) && !a.withdrawn.includes(st.id),
        );
        if (!candidates.length) return;
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        const r = applyJoin(a, pick.id, nick);
        replaceActivity(r.activity, r.notices);
        later(() => simJoinStep(id));
      };
      const startSim = (id: string) => later(() => simJoinStep(id));

      return {
        ...initial(),

        signUp(nickname, email) {
          const errs: { nickname?: string; email?: string } = {};
          const ne = nicknameError(nickname, get().students.map((s) => s.nickname));
          const ee = emailError(email);
          if (ne) errs.nickname = ne;
          if (ee) errs.email = ee;
          if (ne || ee) return errs;
          // the email is checked and then thrown away on purpose
          set({
            user: {
              id: 'me', nickname: nickname.trim(), avatar: randomAvatar(), level: 'Beginner',
              prefs: { types: [], level: 'Beginner', times: [] },
            },
          });
          return null;
        },
        savePrefs: (prefs) => set((s) => (s.user ? { user: { ...s.user, prefs, level: prefs.level } } : {})),
        saveAvatar: (avatar) => set((s) => (s.user ? { user: { ...s.user, avatar } } : {})),
        addType: (name, sport) =>
          set((s) =>
            s.types.some((t) => t.name.toLowerCase() === name.trim().toLowerCase())
              ? {}
              : { types: [...s.types, { name: name.trim(), sport }] },
          ),

        createActivity(input) {
          const s = get();
          const id = 'u' + uid();
          const a = buildActivity(input, 'me', id, Date.now());
          const place = a.place;
          set({
            activities: [a, ...s.activities],
            places: s.places.some((p) => p.toLowerCase() === place.toLowerCase()) ? s.places : [...s.places, place],
          });
          startSim(id);
          return id;
        },

        joinActivity(id) {
          const s = get();
          const a = s.activities.find((x) => x.id === id);
          if (!a) return { ok: false, reason: 'closed' };
          const bad = joinCheck(a, 'me', s.activities, { byUser: s.blocked, ofUser: [] }, Date.now());
          if (bad) return { ok: false, reason: bad };
          const r = applyJoin(a, 'me', nick);
          replaceActivity(r.activity, r.notices);
          if (r.activity.status !== 'Confirmed' || r.activity.kind === 'group') startSim(id);
          return { ok: true };
        },

        leaveActivity(id) {
          const a = get().activities.find((x) => x.id === id);
          if (!a) return;
          const r = applyLeave(a, 'me', nick);
          replaceActivity(r.activity, []);
        },

        rescheduleActivity(id, startsAt) {
          const a = get().activities.find((x) => x.id === id);
          if (!a || a.hostId !== 'me') return;
          const r = applyReschedule(a, startsAt, 'me', Date.now());
          replaceActivity(r.activity, r.notices);
          if (r.activity.status === 'Unconfirmed') startSim(id);
        },

        cancelActivity(id, reason) {
          const a = get().activities.find((x) => x.id === id);
          if (!a) return;
          const r = applyCancel(a, reason, 'me');
          replaceActivity(r.activity, r.notices);
        },

        sendMessage(key, text, replyFrom) {
          const t = text.trim();
          if (!t) return;
          const add = (from: string, txt: string) =>
            set((s) => ({
              chats: { ...s.chats, [key]: [...(s.chats[key] ?? []), { id: uid(), from, text: txt, at: Date.now() }] },
            }));
          add('me', t);
          later(() => {
            const s = get();
            let from = replyFrom;
            if (!from) {
              const a = s.activities.find((x) => x.id === key);
              if (!a || !chatOpen(a)) return;
              const others = a.participants.filter((p) => p !== 'me' && !s.blocked.includes(p));
              if (!others.length) return;
              from = others[Math.floor(Math.random() * others.length)];
            }
            add(from, CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)]);
          }, 2200);
        },

        finishActivity(id) {
          const s = get();
          const a = s.activities.find((x) => x.id === id);
          if (!a || a.status !== 'Confirmed') return;
          const done = markDonePure(a);
          let { ledger, points } = s;
          let gained = 0;
          if (GAME_LAYER) {
            const r = awardOnce(ledger, activityKey(id), POINTS.activity);
            ledger = r.ledger;
            gained = r.gained;
            points += gained;
          }
          set({
            activities: s.activities.map((x) => (x.id === id ? done : x)),
            ledger, points, gained,
          });
          // simulated students answer "play again?" about the user (yes by default)
          if (GAME_LAYER)
            later(() =>
              set((st) => {
                const byFrom = { ...(st.answers[id] ?? {}) };
                for (const p of a.participants.filter((x) => x !== 'me'))
                  byFrom[p] = { ...(byFrom[p] ?? {}), me: 'yes' };
                return { answers: { ...st.answers, [id]: byFrom } };
              }), 1500);
        },

        submitPlayAgain(activityId, picks) {
          set((s) => {
            const byFrom = { ...(s.answers[activityId] ?? {}) };
            byFrom.me = { ...(byFrom.me ?? {}), ...picks };
            return { answers: { ...s.answers, [activityId]: byFrom } };
          });
        },

        completeTwist(id) {
          if (!GAME_LAYER) return;
          set((s) => {
            const r = awardOnce(s.ledger, twistKey(id), POINTS.twist);
            return { ledger: r.ledger, points: s.points + r.gained, gained: r.gained };
          });
        },

        completeQuest(id) {
          if (!GAME_LAYER) return;
          const q = QUESTS.find((x) => x.id === id);
          if (!q) return;
          set((s) => {
            const r = awardOnce(s.ledger, questKey(id), q.points);
            return {
              ledger: r.ledger, points: s.points + r.gained, gained: r.gained,
              questsDone: s.questsDone.includes(id) ? s.questsDone : [...s.questsDone, id],
            };
          });
        },

        joinCommunity: (id) =>
          set((s) => (s.joinedCommunities.includes(id) ? {} : { joinedCommunities: [...s.joinedCommunities, id] })),

        addThread(communityId, title, body) {
          const id = 'th' + uid();
          set((s) => ({
            threads: [{ id, communityId, title: title.trim(), body: body.trim(), authorId: 'me', at: Date.now(), replies: [] }, ...s.threads],
          }));
          return id;
        },

        addReply(threadId, text) {
          set((s) => ({
            threads: s.threads.map((t) =>
              t.id === threadId
                ? { ...t, replies: [...t.replies, { id: uid(), authorId: 'me', text: text.trim(), at: Date.now() }] }
                : t,
            ),
          }));
        },

        markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
        block: (id) => set((s) => (s.blocked.includes(id) ? {} : { blocked: [...s.blocked, id] })),
        unblock: (id) => set((s) => ({ blocked: s.blocked.filter((b) => b !== id) })),
        report: (id, reason) => set((s) => ({ reports: [...s.reports, { studentId: id, reason, at: Date.now() }] })),
        toggleFollow: (id) =>
          set((s) => ({ followed: s.followed.includes(id) ? s.followed.filter((f) => f !== id) : [...s.followed, id] })),

        tick() {
          const now = Date.now();
          const s = get();
          let notices: Notice[] = [];
          const activities = s.activities.map((a) => {
            const r = processDeadline(a, now);
            notices = notices.concat(r.notices);
            return r.activity;
          });
          set({ now, ...(notices.length ? { activities, notifications: withNotices(s.notifications, notices) } : {}) });
        },

        resumeSims() {
          get().activities.forEach((a) => {
            if (a.participants.includes('me') && isLive(a)) startSim(a.id);
          });
        },
        setSimAuto(v) {
          set({ simAuto: v });
          if (v) get().resumeSims();
        },

        demoExpireDeadline(id) {
          set((s) => ({
            activities: s.activities.map((a) => (a.id === id ? { ...a, rsvpDeadline: Date.now() - 1000 } : a)),
          }));
          get().tick();
        },
        demoTimePasses: (id) =>
          set((s) => ({
            activities: s.activities.map((a) => (a.id === id ? { ...a, startsAt: Date.now() - 60_000 } : a)),
          })),
        demoWithdraw(id) {
          const a = get().activities.find((x) => x.id === id);
          if (!a || !isLive(a)) return;
          if (a.hostId === 'me') {
            const who = [...a.participants].reverse().find((p) => p !== 'me');
            if (!who) return;
            const r = applyLeave(a, who, nick);
            replaceActivity(r.activity, r.notices);
          } else {
            const r = applyCancel(a, `${nick(a.hostId)} can no longer make it.`, a.hostId);
            replaceActivity(r.activity, r.notices);
          }
        },
        demoInvite(id) {
          const s = get();
          const a = s.activities.find((x) => x.id === id);
          if (!a || !isLive(a) || a.participants.length >= a.max) return;
          const c = s.students.find((st) => !a.participants.includes(st.id) && !s.blocked.includes(st.id));
          if (!c) return;
          const r = applyJoin(a, c.id, nick);
          replaceActivity(r.activity, r.notices);
        },

        signOut() {
          const now = Date.now();
          set((s) => ({
            user: null,
            // keep the shared dummy world, but remove this user's footprint
            activities: s.activities
              .filter((a) => a.hostId !== 'me')
              .map((a) => {
                if (!a.participants.includes('me') || a.status === 'Done') return a;
                const left = { ...a, participants: a.participants.filter((p) => p !== 'me') };
                return { ...left, status: computeStatus(left) };
              }),
            threads: s.threads
              .filter((t) => t.authorId !== 'me')
              .map((t) => ({ ...t, replies: t.replies.filter((r) => r.authorId !== 'me') })),
            notifications: [{ id: uid(), kind: 'info' as const, text: WELCOME_NOTE, at: now, read: false }],
            chats: {},
            answers: SEED_ANSWERS,
            points: 0, ledger: [], questsDone: [], blocked: [], reports: [], followed: [],
            joinedCommunities: [], gained: 0,
          }));
        },

        resetAll() {
          try { localStorage.removeItem(KEY); } catch { /* ignore */ }
          location.reload();
        },
      };
    },
    { name: KEY, version: 1 },
  ),
);

export function personOf(s: Pick<State, 'user' | 'students'>, id: string): Student | undefined {
  if (id === 'me' && s.user) return { id: 'me', nickname: s.user.nickname, avatar: s.user.avatar, level: s.user.level };
  return s.students.find((x) => x.id === id);
}

export { activityTitle };
