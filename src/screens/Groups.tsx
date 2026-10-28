import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Check, MessageSquare, Plus, Users } from 'lucide-react';
import { useStore } from '../store';
import { Button, Card, Empty, Field, inputCls, Screen, Tag, TopBar } from '../components/ui';
import { Person } from '../components/Person';
import { ActivityCard } from '../components/ActivityCard';
import { isLive } from '../logic/activity';

export function Groups() {
  const communities = useStore((s) => s.communities);
  const joined = useStore((s) => s.joinedCommunities);
  const join = useStore((s) => s.joinCommunity);
  return (
    <Screen>
      <h1 className="pb-3 pt-5 text-2xl font-extrabold">Communities</h1>
      <div className="space-y-3">
        {communities.map((c) => {
          const isIn = joined.includes(c.id);
          return (
            <Card key={c.id} tone={isIn ? 'mint' : 'card'}>
              <h2 className="text-lg font-extrabold">{c.name}</h2>
              <p className="my-1">{c.about}</p>
              <p className="mb-2 flex items-center gap-1 text-sm font-semibold"><Users size={16} aria-hidden /> {c.members + (isIn ? 1 : 0)} members</p>
              <div className="flex gap-2">
                <Link to={`/groups/${c.id}`} className="inline-flex min-h-[48px] items-center rounded-2xl bg-lav px-5 font-bold">Open</Link>
                {isIn ? <Tag cls="bg-white"><Check size={16} aria-hidden /> Joined</Tag> : <Button onClick={() => join(c.id)}>Join</Button>}
              </div>
            </Card>
          );
        })}
      </div>
    </Screen>
  );
}

export function CommunityPage() {
  const { id } = useParams();
  const s = useStore();
  const nav = useNavigate();
  const [tab, setTab] = useState<'d' | 'e'>('d');
  const c = s.communities.find((x) => x.id === id);
  if (!c) return null;
  const isIn = s.joinedCommunities.includes(c.id);
  const threads = s.threads.filter((t) => t.communityId === c.id && !s.blocked.includes(t.authorId)).sort((a, b) => b.at - a.at);
  const events = s.activities
    .filter((a) => a.communityId === c.id && a.audience !== 'general' && isLive(a) && !s.blocked.includes(a.hostId))
    .sort((a, b) => a.startsAt - b.startsAt);
  return (
    <div>
      <TopBar title={c.name} to="/groups" />
      <Screen>
        <p className="mb-3">{c.about}</p>
        {!isIn && <Button full className="mb-3" onClick={() => s.joinCommunity(c.id)}>Join this community</Button>}
        {isIn && <Tag cls="bg-mint"><Check size={16} aria-hidden /> You joined</Tag>}
        <div role="tablist" className="my-4 grid grid-cols-2 gap-2">
          {([['d', 'Discussions'], ['e', 'Events']] as const).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
              className={`min-h-[48px] rounded-2xl border-2 font-bold ${tab === k ? 'border-grape bg-lav' : 'border-line bg-card'}`}>{l}</button>
          ))}
        </div>
        {tab === 'd' ? (
          <>
            <Button full variant="secondary" icon={<Plus size={18} aria-hidden />} className="mb-3"
              onClick={() => (isIn ? nav(`/groups/${c.id}/new`) : s.joinCommunity(c.id))}>
              {isIn ? 'Start a discussion' : 'Join to start a discussion'}
            </Button>
            <div className="space-y-3">
              {threads.map((t) => (
                <Link key={t.id} to={`/groups/${c.id}/thread/${t.id}`} className="block rounded-3xl border-2 border-line bg-card p-4">
                  <p className="text-lg font-extrabold">{t.title}</p>
                  <p className="mb-1 line-clamp-2 text-soft">{t.body}</p>
                  <span className="flex items-center gap-2 text-sm font-semibold"><MessageSquare size={16} aria-hidden /> {t.replies.length} replies</span>
                </Link>
              ))}
              {threads.length === 0 && <Empty title="No discussions yet">Be the first to start one.</Empty>}
            </div>
          </>
        ) : (
          <>
            <Button full variant="secondary" icon={<Plus size={18} aria-hidden />} className="mb-3"
              onClick={() => (isIn ? nav(`/create?community=${c.id}`) : s.joinCommunity(c.id))}>
              {isIn ? 'Create an event' : 'Join to create an event'}
            </Button>
            <div className="space-y-3">
              {events.map((a) => <ActivityCard key={a.id} a={a} />)}
              {events.length === 0 && <Empty title="No events yet">Create one for the community.</Empty>}
            </div>
          </>
        )}
      </Screen>
    </div>
  );
}

export function ThreadPage() {
  const { id, tid } = useParams();
  const s = useStore();
  const [text, setText] = useState('');
  const t = s.threads.find((x) => x.id === tid);
  if (!t) return null;
  const isIn = s.joinedCommunities.includes(t.communityId);
  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    s.addReply(t.id, text);
    setText('');
  };
  return (
    <div>
      <TopBar title="Discussion" to={`/groups/${id}`} />
      <Screen>
        <Card>
          <Person id={t.authorId} size={32} />
          <h2 className="mt-1 text-xl font-extrabold">{t.title}</h2>
          <p className="mt-1">{t.body}</p>
        </Card>
        <h3 className="mb-2 mt-4 font-extrabold">{t.replies.length} replies</h3>
        <div className="space-y-2">
          {t.replies.filter((r) => !s.blocked.includes(r.authorId)).map((r) => (
            <div key={r.id} className="rounded-2xl bg-peach/60 p-3">
              <Person id={r.authorId} size={28} />
              <p>{r.text}</p>
            </div>
          ))}
        </div>
        {isIn ? (
          <form onSubmit={send} className="mt-4 space-y-2">
            <label htmlFor="reply" className="font-bold">Your reply</label>
            <textarea id="reply" rows={3} value={text} onChange={(e) => setText(e.target.value)} className={`${inputCls} py-2`} />
            <Button type="submit" full>Reply</Button>
          </form>
        ) : (
          <Card tone="butter" className="mt-4 text-center">
            <p className="mb-2 font-bold">Join this community to reply.</p>
            <Button onClick={() => s.joinCommunity(t.communityId)}>Join community</Button>
          </Card>
        )}
      </Screen>
    </div>
  );
}

export function NewDiscussion() {
  const { id } = useParams();
  const add = useStore((s) => s.addThread);
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [err, setErr] = useState('');
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3) return setErr('Add a title with at least 3 characters.');
    const tid = add(id!, title, body);
    nav(`/groups/${id}/thread/${tid}`, { replace: true });
  };
  return (
    <div>
      <TopBar title="New discussion" to={`/groups/${id}`} />
      <Screen>
        <form onSubmit={submit} noValidate>
          <Field label="Title" error={err}>
            <input className={inputCls} value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="What do you want to say?">
            <textarea rows={4} className={`${inputCls} py-2`} value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
          <Button type="submit" full>Post</Button>
        </form>
      </Screen>
    </div>
  );
}
