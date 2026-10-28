import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, CheckCircle2, Clock, Flag, XCircle } from 'lucide-react';
import type { Status } from '../types';

export function Button({
  variant = 'primary', full, icon, className = '', children, ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  full?: boolean;
  icon?: ReactNode;
}) {
  const v = {
    primary: 'bg-grape text-white hover:bg-grapedark disabled:bg-[#B9AED0]',
    secondary: 'bg-lav text-ink border-2 border-grape/30 hover:bg-[#d8ccf8]',
    danger: 'bg-rose text-ink border-2 border-[#C2457A] hover:bg-[#f7bfd5]',
    ghost: 'bg-transparent text-grapedark underline',
  }[variant];
  return (
    <button
      {...rest}
      className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl px-5 py-2 text-base font-bold transition disabled:cursor-not-allowed disabled:text-white ${v} ${full ? 'w-full' : ''} ${className}`}
    >
      {icon}
      {children}
    </button>
  );
}

export function Card({ children, className = '', tone = 'card' }: { children: ReactNode; className?: string; tone?: string }) {
  return <div className={`rounded-3xl border-2 border-line bg-${tone} p-4 ${className}`}>{children}</div>;
}

const STATUS = {
  Unconfirmed: { icon: Clock, cls: 'bg-butter', label: 'Unconfirmed' },
  Confirmed: { icon: CheckCircle2, cls: 'bg-mint', label: 'Confirmed' },
  Done: { icon: Flag, cls: 'bg-sky', label: 'Done' },
  Cancelled: { icon: XCircle, cls: 'bg-rose', label: 'Cancelled' },
} as const;

export function StatusTag({ status }: { status: Status }) {
  const s = STATUS[status];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold ${s.cls}`}>
      <Icon size={16} aria-hidden /> {s.label}
    </span>
  );
}
export const statusStyle = STATUS;

export function Tag({ children, cls = 'bg-lav' }: { children: ReactNode; cls?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${cls}`}>{children}</span>;
}

export function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex min-h-[44px] items-center gap-1 rounded-full border-2 px-4 text-base font-semibold ${
        selected ? 'border-grape bg-lav' : 'border-line bg-card'
      }`}
    >
      {selected && <Check size={16} aria-hidden />}
      {children}
    </button>
  );
}

export function TopBar({ title, to, right }: { title: string; to?: string; right?: ReactNode }) {
  const nav = useNavigate();
  const back = () => (to ? nav(to) : window.history.state?.idx > 0 ? nav(-1) : nav('/'));
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 bg-cream/95 px-3 py-2 backdrop-blur">
      <button
        onClick={back}
        className="inline-flex min-h-[44px] items-center gap-1 rounded-2xl bg-lav px-3 font-bold"
      >
        <ArrowLeft size={20} aria-hidden /> Back
      </button>
      <h1 className="flex-1 truncate text-xl font-extrabold">{title}</h1>
      {right}
    </header>
  );
}

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <label className="mb-1 block font-bold">{label}</label>
      {hint && <p className="mb-1 text-sm text-soft">{hint}</p>}
      {children}
      {error && (
        <p role="alert" className="mt-1 flex items-center gap-1 font-semibold text-[#A3204F]">
          <XCircle size={16} aria-hidden /> {error}
        </p>
      )}
    </div>
  );
}

export const inputCls =
  'min-h-[48px] w-full rounded-2xl border-2 border-line bg-card px-4 text-base focus:border-grape';

export function Sheet({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md animate-rise rounded-t-3xl bg-cream p-5 pb-8"
      >
        <h2 className="mb-3 text-xl font-extrabold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="h-4 overflow-hidden rounded-full bg-lav"
      >
        <div className="h-full rounded-full bg-grape" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-sm font-semibold">{label}</p>
    </div>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Card tone="butter" className="text-center">
      <p className="mb-2 text-lg font-extrabold">{title}</p>
      {children}
    </Card>
  );
}

export function Screen({ children }: { children: ReactNode }) {
  return <div className="px-4 pb-4">{children}</div>;
}
