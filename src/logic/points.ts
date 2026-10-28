export const POINT_LEVELS = [
  { name: 'Newcomer', min: 0 },
  { name: 'Explorer', min: 20 },
  { name: 'Regular', min: 50 },
  { name: 'Connector', min: 100 },
  { name: 'Campus Star', min: 180 },
];

export const POINTS = { activity: 10, twist: 5 };

export function levelFor(points: number) {
  let idx = 0;
  POINT_LEVELS.forEach((l, i) => {
    if (points >= l.min) idx = i;
  });
  const cur = POINT_LEVELS[idx];
  const next = POINT_LEVELS[idx + 1];
  return {
    index: idx + 1,
    name: cur.name,
    next: next ? next.min : null,
    progress: next ? (points - cur.min) / (next.min - cur.min) : 1,
  };
}

/** Awards points once per key (e.g. "activity:a1"). Returns the new ledger and points gained. */
export function awardOnce(ledger: string[], key: string, pts: number): { ledger: string[]; gained: number } {
  if (ledger.includes(key)) return { ledger, gained: 0 };
  return { ledger: [...ledger, key], gained: pts };
}

export const activityKey = (id: string) => `activity:${id}`;
export const twistKey = (id: string) => `twist:${id}`;
export const questKey = (id: string) => `quest:${id}`;
