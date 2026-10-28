import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card, Chip, Field, inputCls, Screen, TopBar } from '../components/ui';
import { useStore } from '../store';
import { GAME_LAYER } from '../config';
import { TIME_SLOTS } from '../seed';
import type { Level } from '../types';

export function Welcome() {
  const signUp = useStore((s) => s.signUp);
  const nav = useNavigate();
  const [nick, setNick] = useState('');
  const [email, setEmail] = useState('');
  const [errs, setErrs] = useState<{ nickname?: string; email?: string }>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = signUp(nick, email);
    if (r) setErrs(r);
    else nav('/prefs?first=1', { replace: true });
  };

  return (
    <Screen>
      <div className="pb-4 pt-10 text-center">
        <h1 className="text-4xl font-extrabold text-grapedark">CampusConnect</h1>
        <p className="mt-2 text-lg">Find someone to play, read or hang out with at IBA.</p>
      </div>
      <Card tone="peach" className="mb-5">
        <p className="font-semibold">
          Meet new people on campus in small, easy plans. You only show a nickname. Nobody sees your real name, email or phone number.
        </p>
      </Card>
      <form onSubmit={submit} noValidate>
        <Field label="Nickname" hint="3 to 16 letters, numbers or spaces." error={errs.nickname}>
          <input className={inputCls} value={nick} onChange={(e) => setNick(e.target.value)} autoComplete="off" maxLength={30} />
        </Field>
        <Field label="University email" hint="Only used to check you are from IBA. We do not keep or show it." error={errs.email}>
          <input className={inputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@khi.iba.edu.pk" autoComplete="off" />
        </Field>
        <Button type="submit" full>Start</Button>
      </form>
    </Screen>
  );
}

export function Prefs() {
  const user = useStore((s) => s.user)!;
  const types = useStore((s) => s.types);
  const save = useStore((s) => s.savePrefs);
  const nav = useNavigate();
  const first = useSearchParams()[0].get('first') === '1';
  const [sel, setSel] = useState<string[]>(user.prefs.types);
  const [level, setLevel] = useState<Level>(user.prefs.level);
  const [times, setTimes] = useState<string[]>(user.prefs.times);
  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const done = (store: boolean) => {
    if (store) save({ types: sel, level, times });
    if (!first) nav(-1);
    else nav(GAME_LAYER ? '/avatar?first=1' : '/', { replace: true });
  };

  return (
    <div>
      <TopBar title="Your preferences" to={first ? '/welcome' : undefined} />
      <Screen>
        <p className="mb-4">This helps us suggest plans. You can change it any time and skip it now.</p>
        <Field label="What do you like?">
          <div className="flex flex-wrap gap-2">
            {types.map((t) => <Chip key={t.name} selected={sel.includes(t.name)} onClick={() => setSel(toggle(sel, t.name))}>{t.name}</Chip>)}
          </div>
        </Field>
        <Field label="Your usual level">
          <div className="flex flex-wrap gap-2">
            {(['Beginner', 'Intermediate', 'Advanced'] as Level[]).map((l) => <Chip key={l} selected={level === l} onClick={() => setLevel(l)}>{l}</Chip>)}
          </div>
        </Field>
        <Field label="When are you usually free?">
          <div className="flex flex-wrap gap-2">
            {TIME_SLOTS.map((t) => <Chip key={t} selected={times.includes(t)} onClick={() => setTimes(toggle(times, t))}>{t}</Chip>)}
          </div>
        </Field>
        <div className="space-y-2">
          <Button full onClick={() => done(true)}>Save and continue</Button>
          <Button full variant="ghost" onClick={() => done(false)}>Skip for now</Button>
        </div>
      </Screen>
    </div>
  );
}
