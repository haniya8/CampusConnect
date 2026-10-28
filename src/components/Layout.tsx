import { NavLink, Outlet } from 'react-router-dom';
import { Compass, Home, Sparkles, User, Users } from 'lucide-react';
import { GAME_LAYER } from '../config';

const tabs = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/find', label: 'Find', icon: Compass },
  { to: '/groups', label: 'Groups', icon: Users },
  ...(GAME_LAYER ? [{ to: '/quests', label: 'Quests', icon: Sparkles }] : []),
  { to: '/me', label: 'Me', icon: User },
];

/** Main areas share the bottom tab bar. */
export function TabLayout() {
  return (
    <div className="pb-28">
      <Outlet />
      <nav
        aria-label="Main"
        className="fixed bottom-0 left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 justify-around border-t-2 border-line bg-card px-1 pb-2 pt-1"
      >
        {tabs.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-h-[56px] min-w-[60px] flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl text-sm font-bold ${
                isActive ? 'bg-lav text-grapedark' : 'text-soft'
              }`
            }
          >
            <Icon size={22} aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto min-h-screen max-w-md">{children}</div>;
}
