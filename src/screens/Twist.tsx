import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { PartyPopper } from 'lucide-react';
import { useStore } from '../store';
import { Button, Card, ProgressBar, Screen, TopBar } from '../components/ui';
import { TWIST } from '../seed';
import { GAME_LAYER } from '../config';
import { POINTS } from '../logic/points';

export function Twist() {
  const { id } = useParams();
  const a = useStore((s) => s.activities.find((x) => x.id === id));
  const types = useStore((s) => s.types);
  const complete = useStore((s) => s.completeTwist);
  const nav = useNavigate();
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  if (!GAME_LAYER || !a) return <Navigate to="/" replace />;
  const sport = types.find((t) => t.name === a.type)?.sport ?? false;
  const steps = TWIST.prompts.length + 1;

  const finish = () => {
    complete(a.id);
    setDone(true);
  };
  const skip = (
    <Button full variant="ghost" onClick={() => nav(`/activity/${a.id}`, { replace: true })}>Skip, just play</Button>
  );

  if (done)
    return (
      <div>
        <TopBar title="Twist" to={`/activity/${a.id}`} />
        <Screen>
          <Card tone="mint" className="animate-pop text-center">
            <PartyPopper size={56} className="mx-auto" aria-hidden />
            <h2 className="mt-2 text-2xl font-extrabold">Nice teamwork!</h2>
            <p>You did it together. +{POINTS.twist} points (first time only).</p>
          </Card>
          <Button full className="mt-4" onClick={() => nav(`/activity/${a.id}`, { replace: true })}>Back to the plan</Button>
        </Screen>
      </div>
    );

  return (
    <div>
      <TopBar title="Optional twist" to={`/activity/${a.id}`} />
      <Screen>
        <p className="mb-3 rounded-2xl bg-butter p-3 font-semibold">This is just for fun. You can skip it at any time. Nothing is lost.</p>
        {sport ? (
          <Card className="text-center">
            <h2 className="text-xl font-extrabold">Rally challenge</h2>
            <p className="my-2">{TWIST.sportText}</p>
            <p className="my-4 text-6xl font-extrabold text-grapedark" aria-live="polite">{count}</p>
            <ProgressBar value={count} max={TWIST.sportTarget} label={`${count} of ${TWIST.sportTarget} hits`} />
            <div className="mt-4 space-y-2">
              {count < TWIST.sportTarget ? (
                <Button full onClick={() => setCount(count + 1)}>We hit it! +1</Button>
              ) : (
                <Button full onClick={finish}>We did it!</Button>
              )}
              {count > 0 && count < TWIST.sportTarget && <Button full variant="secondary" onClick={() => setCount(0)}>Start over</Button>}
            </div>
          </Card>
        ) : (
          <Card>
            <p className="mb-1 text-sm font-bold text-soft">Step {step + 1} of {steps}</p>
            <h2 className="mb-4 text-xl font-extrabold">{step < TWIST.prompts.length ? 'Talk about it together' : 'Swap'}</h2>
            <p className="mb-5 text-lg">{step < TWIST.prompts.length ? TWIST.prompts[step] : TWIST.swap}</p>
            {step < steps - 1 ? (
              <Button full onClick={() => setStep(step + 1)}>Next prompt</Button>
            ) : (
              <Button full onClick={finish}>We did it!</Button>
            )}
          </Card>
        )}
        <div className="mt-3">{skip}</div>
      </Screen>
    </div>
  );
}
