export type Level = 'Beginner' | 'Intermediate' | 'Advanced';
export type ActivityLevel = Level | 'Any';
export type Status = 'Unconfirmed' | 'Confirmed' | 'Done' | 'Cancelled';
export type Kind = 'one' | 'group';
export type Audience = 'general' | 'community' | 'both';

export type HairStyle = 'short' | 'long' | 'curly' | 'bun' | 'ponytail' | 'bald' | 'scarf';
export type Accessory = 'none' | 'glasses' | 'sunglasses' | 'headphones' | 'flower';
export type Expression = 'smile' | 'grin' | 'calm' | 'wow';

export interface AvatarSpec {
  skin: number;
  hairStyle: HairStyle;
  hairColor: number;
  outfit: number;
  accessory: Accessory;
  expression: Expression;
  bg: number;
}

export interface Student {
  id: string;
  nickname: string;
  avatar: AvatarSpec;
  level: Level;
}

export interface User {
  id: 'me';
  nickname: string;
  avatar: AvatarSpec;
  level: Level;
  prefs: { types: string[]; level: Level; times: string[] };
}

export interface ActivityType {
  name: string;
  sport: boolean;
}

export interface Activity {
  id: string;
  type: string;
  title: string;
  startsAt: number;
  place: string;
  level: ActivityLevel;
  kind: Kind;
  hostId: string;
  participants: string[];
  max: number;
  min: number;
  rsvpDeadline?: number;
  audience: Audience;
  communityId?: string;
  status: Status;
  cancelReason?: string;
  withdrawn: string[];
  createdAt: number;
}

export interface CreateInput {
  type: string;
  title: string;
  startsAt: number;
  place: string;
  level: ActivityLevel;
  kind: Kind;
  max: number;
  min: number;
  rsvpDeadline?: number;
  audience: Audience;
  communityId?: string;
}

export type NoticeKind =
  | 'joined'
  | 'withdrew'
  | 'confirmed'
  | 'unconfirmed'
  | 'rescheduled'
  | 'cancelled';

/** An event produced by a rule. `to` lists who should hear about it. */
export interface Notice {
  kind: NoticeKind;
  to: string[];
  text: string;
  activityId: string;
}

export interface AppNotification {
  id: string;
  kind: NoticeKind | 'info';
  text: string;
  activityId?: string;
  at: number;
  read: boolean;
}

export interface BlockLists {
  /** people the current user blocked */
  byUser: string[];
  /** people who blocked the current user */
  ofUser: string[];
}

export interface Community {
  id: string;
  name: string;
  about: string;
  members: number;
}

export interface Reply {
  id: string;
  authorId: string;
  text: string;
  at: number;
}

export interface Thread {
  id: string;
  communityId: string;
  title: string;
  body: string;
  authorId: string;
  at: number;
  replies: Reply[];
}

export interface ChatMsg {
  id: string;
  from: string;
  text: string;
  at: number;
}

export interface Quest {
  id: string;
  title: string;
  detail: string;
  points: number;
}
