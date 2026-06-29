const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message } = JSON.parse(req.body || '{}');

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const body = JSON.stringify({
      name, email, subject: subject || '', message,
    });

    const result = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body,
    });

    if (!result.ok) throw new Error('Failed to save message');

    res.status(200).json({ success: true });
  } catch (e) {
    console.error('Contact API error:', e);
    res.status(500).json({ error: e.message });
  }
}
