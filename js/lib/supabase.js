import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';
import { createLocalClient } from './localdb.js';

let client = null;
let useLocal = false;

async function loadSupabase() {
  try {
    // Load Supabase JS client from CDN
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.warn('Supabase unavailable, falling back to local storage:', err.message);
    return null;
  }
}

export async function initSupabase() {
  if (SUPABASE_URL && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
    client = await loadSupabase();
    if (client) {
      useLocal = false;
      console.log('Connected to Supabase');
      return;
    }
  }
  // Fallback to local
  client = createLocalClient();
  useLocal = true;
  console.log('Using local storage');
}

export function getClient() {
  if (!client) {
    // Sync fallback if initSupabase wasn't called yet
    client = createLocalClient();
    useLocal = true;
  }
  return client;
}

export function isLocal() {
  return useLocal;
}
