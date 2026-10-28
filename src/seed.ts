/**
 * ALL dummy data for CampusConnect lives in this file.
 * Times are built relative to "now" the first time the app loads.
 */
import type { Activity, ActivityType, Community, Quest, Student, Thread } from './types';
import type { Answers } from './logic/playAgain';

export const PLACES = [
  'Library',
  'Tennis Court',
  'Badminton Court',
  'OBS Courtyard',
  'Girls Common Room',
  'Student Centre',
];

export const ACTIVITY_TYPES: ActivityType[] = [
  { name: 'Badminton', sport: true },
  { name: 'Table tennis', sport: true },
  { name: 'Reading', sport: false },
];

export const TIME_SLOTS = ['Morning', 'Lunch time', 'Afternoon', 'Evening'];

export const STUDENTS: Student[] = [
  { id: 'mango', nickname: 'Mango', level: 'Intermediate',
    avatar: { skin: 2, hairStyle: 'long', hairColor: 2, outfit: 0, accessory: 'none', expression: 'grin', bg: 0 } },
  { id: 'moonbeam', nickname: 'Moonbeam', level: 'Beginner',
    avatar: { skin: 1, hairStyle: 'scarf', hairColor: 7, outfit: 3, accessory: 'glasses', expression: 'smile', bg: 3 } },
  { id: 'pixel', nickname: 'Pixel', level: 'Advanced',
    avatar: { skin: 4, hairStyle: 'short', hairColor: 0, outfit: 2, accessory: 'headphones', expression: 'calm', bg: 2 } },
  { id: 'rally', nickname: 'Rally', level: 'Advanced',
    avatar: { skin: 3, hairStyle: 'ponytail', hairColor: 1, outfit: 1, accessory: 'none', expression: 'grin', bg: 1 } },
  { id: 'inkwell', nickname: 'Inkwell', level: 'Beginner',
    avatar: { skin: 5, hairStyle: 'curly', hairColor: 0, outfit: 4, accessory: 'glasses', expression: 'smile', bg: 4 } },
  { id: 'comet', nickname: 'Comet', level: 'Intermediate',
    avatar: { skin: 0, hairStyle: 'bun', hairColor: 5, outfit: 5, accessory: 'flower', expression: 'wow', bg: 5 } },
];

export const COMMUNITIES: Community[] = [
  { id: 'lit', name: 'Book Lovers', about: 'Novels, poems and short stories. All reading levels are welcome.', members: 24 },
  { id: 'racquets', name: 'Racquet Friends', about: 'Badminton, table tennis and more. Beginners are welcome.', members: 31 },
  { id: 'explore', name: 'Campus Explorers', about: 'Find quiet corners, small adventures and new faces.', members: 18 },
];

export const QUESTS: Quest[] = [
  { id: 'q1', title: 'Find a quiet reading spot', detail: 'Walk around campus and find a calm place to read for 10 minutes.', points: 10 },
  { id: 'q2', title: 'Spot a butterfly together', detail: 'With someone from your plan, look for a butterfly or a bird on campus.', points: 15 },
  { id: 'q3', title: 'Learn one new word', detail: 'Ask a new friend to teach you a word in their language.', points: 10 },
  { id: 'q4', title: 'Share a book or topic', detail: 'Recommend one book, show or topic to someone you just met.', points: 15 },
  { id: 'q5', title: 'Try something new', detail: 'Join an activity type you have never tried before.', points: 20 },
];

export const TWIST = {
  sportTarget: 10,
  sportText: 'Hit the shuttle or ball back and forth 10 times in a row, together.',
  prompts: [
    'What is a book, show or story you could enjoy again and again?',
    'What is one place on campus you like, and why?',
    'What is something you would like to learn this year?',
  ],
  swap: 'Swap time: tell each other one book or topic you would recommend.',
};

export const CHAT_STARTERS = [
  'Hi! Shall we meet at the entrance?',
  'Is it okay if I am a few minutes early?',
  'I am a beginner. Is that okay?',
  'Do you have a spare racket or book?',
];

export const CANNED_REPLIES = [
  'Sounds good! See you there.',
  'Great, I will be there on time.',
  'I am a little nervous but excited!',
  'I will wear something bright so you can spot me.',
  'Perfect. See you soon!',
  'Yes, that works for me.',
];

export const REPORT_REASONS = [
  'Rude or unkind messages',
  'Made me feel unsafe',
  'Did not show up',
  'Spam or ads',
  'Something else',
];

export const CANCEL_REASONS = ['Something came up', 'Bad weather', 'Not enough people', 'Changed my plans'];

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

function at(base: number, dayOffset: number, hour: number, minute = 0): number {
  const d = new Date(base);
  d.setHours(hour, minute, 0, 0);
  return d.getTime() + dayOffset * DAY;
}

export function buildActivities(now: number): Activity[] {
  const base = (p: Partial<Activity> & Pick<Activity, 'id' | 'type' | 'startsAt' | 'place' | 'hostId' | 'participants'>): Activity => ({
    title: '', level: 'Any', kind: 'one', max: 2, min: 2, audience: 'general', status: 'Unconfirmed',
    withdrawn: [], createdAt: now - DAY, ...p,
  });
  return [
    base({ id: 'a1', type: 'Badminton', title: 'Fast rallies', startsAt: at(now, 1, 11), place: 'Badminton Court', level: 'Advanced', hostId: 'rally', participants: ['rally'] }),
    base({ id: 'a2', type: 'Table tennis', title: 'Easy table tennis', startsAt: at(now, 1, 13), place: 'Student Centre', level: 'Beginner', hostId: 'pixel', participants: ['pixel'] }),
    base({ id: 'a3', type: 'Reading', title: 'Short story swap', startsAt: at(now, 2, 17), place: 'Library', kind: 'group', max: 8, min: 4,
      rsvpDeadline: at(now, 1, 20), hostId: 'inkwell', participants: ['inkwell', 'moonbeam'], audience: 'both', communityId: 'lit' }),
    base({ id: 'a4', type: 'Badminton', title: 'Beginner doubles warm-up', startsAt: at(now, 1, 17, 30), place: 'Badminton Court', level: 'Beginner',
      hostId: 'mango', participants: ['mango', 'comet'], status: 'Confirmed' }),
    base({ id: 'a5', type: 'Reading', title: 'Quiet reading hour', startsAt: at(now, 1, 10), place: 'Library', level: 'Intermediate', hostId: 'comet', participants: ['comet'] }),
    base({ id: 'a6', type: 'Table tennis', title: 'Doubles fun', startsAt: at(now, 2, 16, 30), place: 'Student Centre', kind: 'group', max: 4, min: 3,
      rsvpDeadline: at(now, 1, 12), hostId: 'rally', participants: ['rally', 'pixel'] }),
    base({ id: 'a7', type: 'Reading', title: 'Poetry open mic', startsAt: at(now, 3, 17), place: 'Student Centre', kind: 'group', max: 10, min: 4,
      rsvpDeadline: at(now, 2, 17), hostId: 'inkwell', participants: ['inkwell'], audience: 'community', communityId: 'lit' }),
    // finished (appear in the user's history)
    base({ id: 'h1', type: 'Table tennis', title: 'Friendly rally', startsAt: at(now, -3, 15), place: 'Student Centre', hostId: 'pixel',
      participants: ['pixel', 'me'], status: 'Done', createdAt: now - 5 * DAY }),
    base({ id: 'h2', type: 'Reading', title: 'First book chat', startsAt: at(now, -5, 17), place: 'Library', kind: 'group', max: 6, min: 3,
      rsvpDeadline: at(now, -6, 12), hostId: 'inkwell', participants: ['inkwell', 'comet', 'me', 'moonbeam'], status: 'Done', createdAt: now - 7 * DAY }),
  ];
}

export const SEED_ANSWERS: Answers = {
  h1: { me: { pixel: 'yes' }, pixel: { me: 'yes' } },
  h2: { me: { inkwell: 'yes', comet: 'yes' }, inkwell: { me: 'yes' }, comet: { me: 'no' } },
};

export function buildThreads(now: number): Thread[] {
  const r = (id: string, authorId: string, text: string, h: number) => ({ id, authorId, text, at: now - h * HOUR });
  return [
    { id: 't1', communityId: 'lit', title: 'What are you reading right now?', authorId: 'inkwell', at: now - 30 * HOUR,
      body: 'I am halfway through a mystery novel. Tell me what is on your table.',
      replies: [r('r1', 'moonbeam', 'Re-reading Pride and Prejudice. It is slow but lovely.', 28), r('r2', 'comet', 'A short story collection. One story per night.', 20)] },
    { id: 't2', communityId: 'lit', title: 'Easy English novels for beginners?', authorId: 'moonbeam', at: now - 52 * HOUR,
      body: 'English is my second language. Which novels have simple words?',
      replies: [r('r3', 'inkwell', 'Try "Of Mice and Men". It is short and clear.', 50), r('r4', 'mango', 'Also "The Alchemist". Easy and kind.', 44)] },
    { id: 't3', communityId: 'lit', title: 'Urdu or English? Let us share both', authorId: 'comet', at: now - 80 * HOUR,
      body: 'Maybe we can share one favourite line from any language at our next meetup.',
      replies: [r('r5', 'inkwell', 'Yes! A Book Baithak idea.', 70)] },
    { id: 't4', communityId: 'racquets', title: 'Anyone for a slow rally on weekends?', authorId: 'rally', at: now - 26 * HOUR,
      body: 'No scores, no stress. Just hitting the shuttle.',
      replies: [r('r6', 'pixel', 'I am in if the court is free.', 20), r('r7', 'mango', 'Count me in as a beginner.', 18)] },
    { id: 't5', communityId: 'racquets', title: 'Which shoes for the court?', authorId: 'mango', at: now - 60 * HOUR,
      body: 'Do I need special shoes or are normal sports shoes fine?', replies: [r('r8', 'rally', 'Normal sports shoes with good grip are fine.', 55)] },
    { id: 't6', communityId: 'explore', title: 'Best quiet reading spots on campus', authorId: 'comet', at: now - 40 * HOUR,
      body: 'Share your calm corners. I like the Library window seats.', replies: [r('r9', 'pixel', 'The OBS Courtyard in the morning.', 36)] },
    { id: 't7', communityId: 'explore', title: 'Butterflies near the courtyard', authorId: 'pixel', at: now - 90 * HOUR,
      body: 'Saw three yellow butterflies today. Has anyone else?', replies: [] },
  ];
}

export const WELCOME_NOTE = 'Welcome to CampusConnect! Find a plan or create your own.';
