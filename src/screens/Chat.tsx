import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Lock, Send, ShieldCheck } from 'lucide-react';
import { useStore } from '../store';
import { Button, Card, Screen, TopBar } from '../components/ui';
import { Person } from '../components/Person';
import { chatOpen, neededToConfirm } from '../logic/activity';
import { activityTitle } from '../logic/format';
import { CHAT_STARTERS } from '../seed';

function ChatBox({ storeKey, replyFrom }: { storeKey: string; replyFrom?: string }) {
  const msgs = useStore((s) => s.chats[storeKey]) ?? [];
  const send = useStore((s) => s.sendMessage);
  const blocked = useStore((s) => s.blocked);
  const [text, setText] = useState('');
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs.length]);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    send(storeKey, text, replyFrom);
    setText('');
  };
  return (
    <>
      <p className="mb-3 flex items-start gap-2 rounded-2xl bg-sky p-3 text-sm font-semibold">
        <ShieldCheck size={18} className="mt-0.5 shrink-0" aria-hidden />
        Phone numbers stay private. Please do not share yours here.
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        {CHAT_STARTERS.map((c) => (
          <button key={c} type="button" onClick={() => setText(c)} className="min-h-[44px] rounded-full border-2 border-grape/40 bg-lav px-3 text-sm font-semibold">{c}</button>
        ))}
      </div>
      <div className="mb-24 space-y-3" aria-live="polite">
        {msgs.filter((m) => !blocked.includes(m.from)).map((m) =>
          m.from === 'me' ? (
            <div key={m.id} className="ml-10 rounded-2xl rounded-br-sm bg-grape p-3 text-white">{m.text}</div>
          ) : (
            <div key={m.id} className="mr-10">
              <Person id={m.from} size={28} link={false} />
              <div className="rounded-2xl rounded-tl-sm bg-peach p-3">{m.text}</div>
            </div>
          ),
        )}
        {msgs.length === 0 && <p className="text-center text-soft">No messages yet. Tap a starter above or say hi.</p>}
        <div ref={end} />
      </div>
      <form onSubmit={submit} className="fixed bottom-0 left-1/2 flex w-full max-w-md -translate-x-1/2 gap-2 border-t-2 border-line bg-cream p-3">
        <input value={text} onChange={(e) => setText(e.target.value)} aria-label="Message" placeholder="Write a message"
          className="min-h-[48px] flex-1 rounded-2xl border-2 border-line bg-card px-4" />
        <Button type="submit" aria-label="Send message" icon={<Send size={18} aria-hidden />}>Send</Button>
      </form>
    </>
  );
}

export function ActivityChat() {
  const { id } = useParams();
  const a = useStore((s) => s.activities.find((x) => x.id === id));
  if (!a) return null;
  const open = chatOpen(a);
  return (
    <div>
      <TopBar title="Chat" to={`/activity/${a.id}`} />
      <Screen>
        <p className="mb-3 font-bold">{activityTitle(a)}</p>
        {open ? (
          <ChatBox storeKey={a.id} />
        ) : (
          <Card tone="butter" className="text-center">
            <Lock size={40} className="mx-auto" aria-hidden />
            <p className="mt-2 text-lg font-extrabold">Chat is locked</p>
            <p>
              {a.status === 'Unconfirmed' && `The chat opens when the plan is confirmed. It needs ${neededToConfirm(a)} more ${neededToConfirm(a) === 1 ? 'person' : 'people'}.`}
              {a.status === 'Cancelled' && 'This plan was cancelled, so the chat is closed.'}
              {a.status === 'Done' && 'This plan is finished, so the chat is closed.'}
            </p>
          </Card>
        )}
      </Screen>
    </div>
  );
}

export function DirectChat() {
  const { id } = useParams();
  const st = useStore((s) => s.students.find((x) => x.id === id));
  if (!st) return null;
  return (
    <div>
      <TopBar title={`Message ${st.nickname}`} />
      <Screen><ChatBox storeKey={`dm:${st.id}`} replyFrom={st.id} /></Screen>
    </div>
  );
}
