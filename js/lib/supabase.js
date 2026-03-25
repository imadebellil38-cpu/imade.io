import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';
import { createLocalClient } from './localdb.js';

let client = null;
let useLocal = false;

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
  ]);
}

async function loadSupabase() {
  try {
    const { createClient } = await withTimeout(
      import('https://esm.sh/@supabase/supabase-js@2'),
      5000
    );
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.warn('Supabase unavailable:', err.message);
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
  client = createLocalClient();
  useLocal = true;
  console.log('Using local storage');
}

export function getClient() {
  if (!client) {
    client = createLocalClient();
    useLocal = true;
  }
  return client;
}

export function isLocal() {
  return useLocal;
}
