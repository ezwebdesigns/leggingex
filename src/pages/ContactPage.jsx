import { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePageMeta } from '@/hooks/usePageMeta';

export default function ContactPage() {
  usePageMeta({
    title: 'Contact us | Legging Express',
    description: 'A question? A suggestion? Get in touch with the Legging Express team.',
  });
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to send');
      setSent(true);
    } catch {
      setError('An error occurred. Please try again.');
    }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-4 lg:px-14 py-16">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contact us</h1>
            <p className="text-sm text-muted-foreground">A question? A suggestion? Write to us!</p>
          </div>
        </div>

        {sent ? (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <p className="text-green-700 font-semibold text-lg">Message sent!</p>
            <p className="text-green-600 text-sm mt-2">We will get back to you as soon as possible.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              type="text" name="name" placeholder="Name" required
              value={form.name} onChange={handleChange}
              className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors text-sm"
            />
            <input
              type="email" name="email" placeholder="Email" required
              value={form.email} onChange={handleChange}
              className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors text-sm"
            />
            <input
              type="text" name="subject" placeholder="Subject"
              value={form.subject} onChange={handleChange}
              className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors text-sm"
            />
            <textarea
              name="message" placeholder="Message" required rows={5}
              value={form.message} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors text-sm resize-none"
            />
            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <Button type="submit" disabled={sending} className="w-full h-12 rounded-xl text-base font-semibold">
              {sending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Send
                </span>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
