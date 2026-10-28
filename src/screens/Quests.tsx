import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Check, Star, Trophy } from 'lucide-react';
import { useStore } from '../store';
import { Button, Card, ProgressBar, Screen, Tag, TopBar } from '../components/ui';
import { QUESTS } from '../seed';
import { levelFor } from '../logic/points';
import { GAME_LAYER } from '../config';

export function Quests() {
  const points = useStore((s) => s.points);
  const done = useStore((s) => s.questsDone);
  const complete = useStore((s) => s.completeQuest);
  const nav = useNavigate();
  const lv = levelFor(points);
  if (!GAME_LAYER) return <Navigate to="/" replace />;
  return (
    <Screen>
      <h1 className="pb-3 pt-5 text-2xl font-extrabold">Quests</h1>
      <Card tone="butter" className="mb-4">
        <p className="flex items-center gap-2 text-lg font-extrabold"><Star size={20} aria-hidden /> {points} points · Level {lv.index}: {lv.name}</p>
        <div className="mt-2">
          <ProgressBar value={Math.round(lv.progress * 100)} max={100} label={lv.next ? `${lv.next - points} points to the next level` : 'Top level reached'} />
        </div>
      </Card>
      <p className="mb-3">Quests are small extras. Do them if you like. You never have to.</p>
      <div className="space-y-3">
        {QUESTS.map((q) => {
          const isDone = done.includes(q.id);
          return (
            <Card key={q.id} tone={isDone ? 'mint' : 'card'}>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-extrabold">{q.title}</h2>
                <Tag cls="bg-butter">+{q.points} pts</Tag>
              </div>
              <p className="my-1">{q.detail}</p>
              {isDone ? (
                <p className="flex items-center gap-1 font-bold"><Check size={18} aria-hidden /> Done</p>
              ) : (
                <Button variant="secondary" onClick={() => { complete(q.id); nav(`/quests/${q.id}/done`); }}>Mark as done</Button>
              )}
            </Card>
          );
        })}
      </div>
    </Screen>
  );
}

export function QuestDone() {
  const { id } = useParams();
  const q = QUESTS.find((x) => x.id === id);
  const points = useStore((s) => s.points);
  const nav = useNavigate();
  if (!q || !GAME_LAYER) return <Navigate to="/quests" replace />;
  const lv = levelFor(points);
  return (
    <div>
      <TopBar title="Quest done" to="/quests" />
      <Screen>
        <Card tone="mint" className="animate-pop text-center">
          <Trophy size={56} className="mx-auto" aria-hidden />
          <h2 className="mt-2 text-2xl font-extrabold">Well done!</h2>
          <p className="font-semibold">{q.title}</p>
          <p className="mt-2">You now have {points} points. Level {lv.index}: {lv.name}.</p>
        </Card>
        <Button full className="mt-4" onClick={() => nav('/quests', { replace: true })}>Back to quests</Button>
      </Screen>
    </div>
  );
}
