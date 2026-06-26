import { supabase } from './supabaseClient';

const cache = {};

export async function getSettings() {
  if (cache.data) return cache.data;
  const { data } = await supabase.from('settings').select('*');
  if (!data) return {};
  const settings = {};
  data.forEach((row) => { settings[row.key] = row.value; });
  cache.data = settings;
  return settings;
}

export function invalidateSettings() {
  delete cache.data;
}
