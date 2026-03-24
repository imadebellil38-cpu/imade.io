import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

let client = null;

export function getClient() {
  if (!client) {
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return client;
}
