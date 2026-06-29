import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Mail, Trash2, Check, CheckCheck, ChevronDown, ChevronUp, Inbox } from 'lucide-react';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email;
    const res = await fetch('/api/admin/messages', {
      headers: { 'x-admin-email': email || '' },
    });
    const data = await res.json();
    setMessages(data.messages || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleRead(msg) {
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email;
    await fetch('/api/admin/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-email': email || '' },
      body: JSON.stringify({ id: msg.id, read: !msg.read }),
    });
    load();
  }

  async function remove(id) {
    if (!confirm('Delete this message?')) return;
    const { data: { session } } = await supabase.auth.getSession();
    const email = session?.user?.email;
    await fetch('/api/admin/messages', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-admin-email': email || '' },
      body: JSON.stringify({ id }),
    });
    load();
  }

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-lg font-semibold text-foreground">Messages</h2>
        {unread > 0 && (
          <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{unread} unread</span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Inbox className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <div key={msg.id} className={`bg-card border rounded-xl transition-colors ${!msg.read ? 'border-primary/30 bg-primary/[0.03]' : 'border-border'}`}>
              <button onClick={() => setExpanded(expanded === msg.id ? null : msg.id)} className="w-full flex items-center gap-3 p-4 text-left">
                <div className={`w-2 h-2 rounded-full shrink-0 ${!msg.read ? 'bg-primary' : 'bg-transparent'}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground truncate">{msg.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{msg.subject || '(no subject)'}</div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">{new Date(msg.created_at).toLocaleDateString()}</div>
                <div className="flex items-center gap-1 shrink-0">
                  <span onClick={(e) => { e.stopPropagation(); toggleRead(msg); }} className="p-1.5 text-muted-foreground hover:text-primary cursor-pointer" title={msg.read ? 'Mark unread' : 'Mark read'}>
                    {msg.read ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </span>
                  <span onClick={(e) => { e.stopPropagation(); remove(msg.id); }} className="p-1.5 text-muted-foreground hover:text-destructive cursor-pointer"><Trash2 className="w-4 h-4" /></span>
                  {expanded === msg.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </button>
              {expanded === msg.id && (
                <div className="px-4 pb-4 pt-0 border-t border-border">
                  <div className="text-xs text-muted-foreground mb-2">
                    From: {msg.name} &lt;{msg.email}&gt; &middot; {new Date(msg.created_at).toLocaleString()}
                  </div>
                  <div className="text-sm text-foreground whitespace-pre-wrap bg-secondary rounded-2xl p-4">
                    {msg.message}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
