import { getClient } from '../lib/supabase.js';

const db = () => getClient();

export async function signUpWithEmail(email, password) {
  const { data, error } = await db().auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email, password) {
  const { data, error } = await db().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await db().auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + window.location.pathname }
  });
  if (error) throw error;
  return data;
}

export async function resetPassword(email) {
  const { error } = await db().auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname + '#login'
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await db().auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  try {
    const result = await Promise.race([
      db().auth.getSession(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('session timeout')), 6000))
    ]);
    return result.data?.session || null;
  } catch {
    console.warn('getSession failed or timed out');
    return null;
  }
}

export async function getUser() {
  const { data: { user } } = await db().auth.getUser();
  return user;
}

export function onAuthStateChange(callback) {
  return db().auth.onAuthStateChange(callback);
}
