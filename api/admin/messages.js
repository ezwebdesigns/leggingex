const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'socialmediascanada@gmail.com';

const AUTH_HEADERS = { 'Content-Type': 'application/json' };

async function supaQuery(params, method = 'GET', body = null) {
  const url = `${SUPABASE_URL}/rest/v1/messages?${params || ''}`;
  const opts = {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = typeof body === 'string' ? body : JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok && method !== 'DELETE') throw new Error('Supabase error');
  if (method === 'GET') return res.json();
  return {};
}

export default async function handler(req, res) {
  const email = req.headers['x-admin-email'];
  if (email !== ADMIN_EMAIL) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const messages = await supaQuery('order=created_at.desc', 'GET');
      return res.status(200).json({ messages });
    }

    if (req.method === 'PATCH') {
      const { id, read } = JSON.parse(req.body || '{}');
      if (!id) return res.status(400).json({ error: 'ID required' });
      await supaQuery(`id=eq.${id}`, 'PATCH', { read });
      return res.status(200).json({ ok: true });
    }

    if (req.method === 'DELETE') {
      const { id } = JSON.parse(req.body || '{}');
      if (!id) return res.status(400).json({ error: 'ID required' });
      await supaQuery(`id=eq.${id}`, 'DELETE');
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('Admin Messages API error:', e);
    res.status(500).json({ error: e.message });
  }
}
