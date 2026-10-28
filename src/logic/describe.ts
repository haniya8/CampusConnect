import type { Activity } from '../types';
import { neededToConfirm } from './activity';
import { fmtWhen } from './format';

export function statusSummary(a: Activity, now: number): { headline: string; detail: string } {
  switch (a.status) {
    case 'Cancelled':
      return { headline: 'Cancelled', detail: a.cancelReason ? `Reason: ${a.cancelReason}` : 'This plan was cancelled.' };
    case 'Done':
      return { headline: 'Finished', detail: 'This activity is finished.' };
    case 'Confirmed':
      return {
        headline: 'Confirmed',
        detail:
          a.kind === 'one'
            ? 'Both of you are going.'
            : `${a.participants.length} people are going. The minimum of ${a.min} is reached.`,
      };
    default: {
      const n = neededToConfirm(a);
      if (a.startsAt <= now)
        return {
          headline: 'Not confirmed',
          detail: 'The planned time has passed and the plan was never confirmed.',
        };
      if (a.kind === 'one')
        return { headline: 'Not confirmed yet', detail: 'This plan is confirmed when 1 more person joins.' };
      return {
        headline: 'Not confirmed yet',
        detail: `Needs ${n} more ${n === 1 ? 'yes' : 'yeses'} (minimum ${a.min}) by ${a.rsvpDeadline ? fmtWhen(a.rsvpDeadline, now) : 'the start time'}.`,
      };
    }
  }
}
