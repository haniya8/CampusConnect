export type Answer = 'yes' | 'no';
/** activityId -> fromId -> toId -> answer */
export type Answers = Record<string, Record<string, Record<string, Answer>>>;

const said = (answers: Answers, activityId: string, from: string, to: string) =>
  answers[activityId]?.[from]?.[to];

/** A match exists only if BOTH said yes. "No" and "no answer" are treated the same. */
export function isMutualYes(answers: Answers, activityId: string, a: string, b: string): boolean {
  return said(answers, activityId, a, b) === 'yes' && said(answers, activityId, b, a) === 'yes';
}

export interface Outcome {
  matches: string[];
}

/** The only thing a person is ever shown: who matched. Nothing else about others' answers. */
export function outcomeFor(answers: Answers, activityId: string, me: string, others: string[]): Outcome {
  return { matches: others.filter((o) => o !== me && isMutualYes(answers, activityId, me, o)) };
}

export function preferredPartners(answers: Answers, me: string): string[] {
  const out = new Set<string>();
  for (const [actId, byFrom] of Object.entries(answers)) {
    for (const to of Object.keys(byFrom[me] ?? {})) {
      if (isMutualYes(answers, actId, me, to)) out.add(to);
    }
  }
  return [...out];
}
