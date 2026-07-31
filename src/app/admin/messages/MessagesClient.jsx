'use client';

import { useState } from 'react';
import { Mail, MailOpen, Trash2, Inbox } from 'lucide-react';
import AdminShell from '@/components/admin/AdminShell';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/ui/EmptyState';
import { formatDate, initials } from '@/lib/format';
import { getMessages, updateMessage, deleteMessage, getSubscribers } from '@/lib/data';
import { useData } from '@/lib/hooks';
import { useToast } from '@/context/ToastContext';

export default function MessagesClient() {
  const { data: messages, refresh } = useData(() => getMessages(), [], []);
  const { data: subscribers } = useData(() => getSubscribers(), [], []);
  const { toast } = useToast();
  const [confirm, setConfirm] = useState(null);

  const list = messages || [];
  const unread = list.filter((m) => !m.isRead).length;

  return (
    <AdminShell title="Messages" subtitle={`${list.length} enquiries, ${unread} unread`}>
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          {list.length === 0 ? (
            <EmptyState icon={Inbox} title="No messages yet"
              description="Enquiries sent through the contact form land here." />
          ) : (
            list.map((m) => (
              <article key={m.id} className={`rounded-2xl bg-white p-5 shadow-soft ${!m.isRead ? 'border-l-4 border-gold-500' : ''}`}>
                <div className="flex flex-wrap items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-100 text-xs font-bold text-gold-700">
                    {initials(m.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{m.name}</p>
                    <p className="text-xs text-ink-400">{m.email}{m.phone ? ` · ${m.phone}` : ''}</p>
                  </div>
                  <span className="text-xs text-ink-400">{formatDate(m.createdAt)}</span>
                  <div className="flex gap-1">
                    <button onClick={async () => { await updateMessage(m.id, { isRead: !m.isRead }); refresh(); }}
                      title={m.isRead ? 'Mark unread' : 'Mark read'}
                      className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-cream hover:text-gold-600">
                      {m.isRead ? <MailOpen size={15} /> : <Mail size={15} />}
                    </button>
                    <button onClick={() => setConfirm(m)} title="Delete"
                      className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
                  </div>
                </div>
                <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-gold-600">{m.subject}</p>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink-600">{m.body}</p>
                <a href={`mailto:${m.email}`} className="btn-outline btn-sm mt-4">Reply by email</a>
              </article>
            ))
          )}
        </div>

        <aside className="rounded-2xl bg-white p-5 shadow-soft lg:h-fit">
          <h2 className="font-semibold">Newsletter list</h2>
          <p className="text-xs text-ink-400">{(subscribers || []).length} subscribers</p>
          <ul className="mt-4 max-h-96 space-y-2 overflow-y-auto text-sm">
            {(subscribers || []).length === 0 && <li className="text-xs text-ink-400">No subscribers yet.</li>}
            {(subscribers || []).map((s) => (
              <li key={s.id} className="truncate border-b border-ink-100 pb-2 text-ink-600">{s.email}</li>
            ))}
          </ul>
        </aside>
      </div>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        onConfirm={async () => { await deleteMessage(confirm.id); refresh(); toast('Message deleted', 'info'); }}
        title="Delete this message?" />
    </AdminShell>
  );
}
