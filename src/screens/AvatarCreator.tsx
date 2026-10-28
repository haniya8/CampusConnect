import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Shuffle } from 'lucide-react';
import { Avatar } from '../avatar/Avatar';
import { ACCESSORIES, BGS, EXPRESSIONS, HAIR_COLORS, HAIR_STYLES, OUTFITS, SKINS, randomAvatar } from '../avatar/parts';
import { Button, Chip, Screen, TopBar } from '../components/ui';
import { useStore } from '../store';
import type { AvatarSpec } from '../types';

function Swatches({ label, items, value, onPick }: { label: string; items: { name: string; value: string }[]; value: number; onPick: (i: number) => void }) {
  return (
    <section className="mb-4">
      <h2 className="mb-1 font-bold">{label}: <span className="font-semibold text-soft">{items[value]?.name}</span></h2>
      <div className="flex flex-wrap gap-2">
        {items.map((it, i) => (
          <button
            key={it.name}
            type="button"
            aria-label={it.name}
            aria-pressed={value === i}
            title={it.name}
            onClick={() => onPick(i)}
            className={`flex h-11 w-11 items-center justify-center rounded-full border-4 ${value === i ? 'border-ink' : 'border-white'}`}
            style={{ background: it.value }}
          >
            {value === i && <Check size={18} aria-hidden />}
          </button>
        ))}
      </div>
    </section>
  );
}

function Options<T extends string>({ label, items, value, onPick }: { label: string; items: { id: T; name: string }[]; value: T; onPick: (v: T) => void }) {
  return (
    <section className="mb-4">
      <h2 className="mb-1 font-bold">{label}</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((it) => <Chip key={it.id} selected={value === it.id} onClick={() => onPick(it.id)}>{it.name}</Chip>)}
      </div>
    </section>
  );
}

export function AvatarCreator() {
  const user = useStore((s) => s.user)!;
  const save = useStore((s) => s.saveAvatar);
  const nav = useNavigate();
  const first = useSearchParams()[0].get('first') === '1';
  const [a, setA] = useState<AvatarSpec>(user.avatar);
  const set = <K extends keyof AvatarSpec>(k: K, v: AvatarSpec[K]) => setA({ ...a, [k]: v });

  const finish = () => {
    save(a);
    if (first) nav('/', { replace: true });
    else nav(-1);
  };

  return (
    <div>
      <TopBar title="Your avatar" to={first ? '/prefs?first=1' : undefined} />
      <Screen>
        <div className="mb-4 flex flex-col items-center gap-3">
          <Avatar spec={a} size={160} label="Your avatar preview" />
          <p className="text-lg font-extrabold">{user.nickname}</p>
          <Button variant="secondary" icon={<Shuffle size={18} aria-hidden />} onClick={() => setA(randomAvatar())}>Surprise me</Button>
        </div>
        <Swatches label="Skin tone" items={SKINS} value={a.skin} onPick={(i) => set('skin', i)} />
        <Options label="Hair style" items={HAIR_STYLES} value={a.hairStyle} onPick={(v) => set('hairStyle', v)} />
        <Swatches label={a.hairStyle === 'scarf' ? 'Scarf colour' : 'Hair colour'} items={HAIR_COLORS} value={a.hairColor} onPick={(i) => set('hairColor', i)} />
        <Swatches label="Outfit colour" items={OUTFITS} value={a.outfit} onPick={(i) => set('outfit', i)} />
        <Options label="Accessory" items={ACCESSORIES} value={a.accessory} onPick={(v) => set('accessory', v)} />
        <Options label="Expression" items={EXPRESSIONS} value={a.expression} onPick={(v) => set('expression', v)} />
        <Swatches label="Background" items={BGS} value={a.bg} onPick={(i) => set('bg', i)} />
        <div className="space-y-2 pb-6">
          <Button full onClick={finish}>Save avatar</Button>
          <Button full variant="ghost" onClick={() => (first ? nav('/', { replace: true }) : nav(-1))}>
            {first ? 'Skip, keep this one' : 'Cancel'}
          </Button>
        </div>
      </Screen>
    </div>
  );
}
