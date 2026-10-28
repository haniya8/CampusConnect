import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useStore } from './store';
import { Shell, TabLayout } from './components/Layout';
import { Prefs, Welcome } from './screens/Onboarding';
import { AvatarCreator } from './screens/AvatarCreator';
import { Home } from './screens/Home';
import { Find } from './screens/Find';
import { Create } from './screens/Create';
import { ActivityPage, Joined } from './screens/ActivityPage';
import { ActivityChat, DirectChat } from './screens/Chat';
import { Twist } from './screens/Twist';
import { After, Result } from './screens/After';
import { QuestDone, Quests } from './screens/Quests';
import { CommunityPage, Groups, NewDiscussion, ThreadPage } from './screens/Groups';
import { Demo, History, Me, Notifications, Report, ReportDone, StudentPage } from './screens/Misc';
import { GAME_LAYER } from './config';

function Guarded({ children }: { children: React.ReactNode }) {
  const user = useStore((s) => s.user);
  return user ? <>{children}</> : <Navigate to="/welcome" replace />;
}

export default function App() {
  const tick = useStore((s) => s.tick);
  const resume = useStore((s) => s.resumeSims);
  useEffect(() => {
    tick();
    resume();
    const t = setInterval(tick, 2000);
    return () => clearInterval(t);
  }, [tick, resume]);

  const g = (el: React.ReactNode) => <Guarded>{el}</Guarded>;
  return (
    <HashRouter>
      <Shell>
        <Routes>
          <Route path="/welcome" element={<Welcome />} />
          <Route element={g(<TabLayout />)}>
            <Route path="/" element={<Home />} />
            <Route path="/find" element={<Find />} />
            <Route path="/groups" element={<Groups />} />
            {GAME_LAYER && <Route path="/quests" element={<Quests />} />}
            <Route path="/me" element={<Me />} />
          </Route>
          <Route path="/prefs" element={g(<Prefs />)} />
          <Route path="/avatar" element={GAME_LAYER ? g(<AvatarCreator />) : <Navigate to="/" replace />} />
          <Route path="/create" element={g(<Create />)} />
          <Route path="/activity/:id" element={g(<ActivityPage />)} />
          <Route path="/activity/:id/joined" element={g(<Joined />)} />
          <Route path="/activity/:id/chat" element={g(<ActivityChat />)} />
          <Route path="/activity/:id/twist" element={g(<Twist />)} />
          <Route path="/activity/:id/after" element={g(<After />)} />
          <Route path="/activity/:id/result" element={g(<Result />)} />
          <Route path="/dm/:id" element={g(<DirectChat />)} />
          <Route path="/quests/:id/done" element={g(<QuestDone />)} />
          <Route path="/groups/:id" element={g(<CommunityPage />)} />
          <Route path="/groups/:id/new" element={g(<NewDiscussion />)} />
          <Route path="/groups/:id/thread/:tid" element={g(<ThreadPage />)} />
          <Route path="/history" element={g(<History />)} />
          <Route path="/notifications" element={g(<Notifications />)} />
          <Route path="/student/:id" element={g(<StudentPage />)} />
          <Route path="/report/:id" element={g(<Report />)} />
          <Route path="/report/:id/done" element={g(<ReportDone />)} />
          <Route path="/demo" element={g(<Demo />)} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </HashRouter>
  );
}
