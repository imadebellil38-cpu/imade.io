import { getClient } from '../lib/supabase.js';

const db = () => getClient();

export async function createMember({ pseudo, avatar_emoji, bio }) {
  const { data, error } = await db()
    .from('members')
    .insert({ pseudo, avatar_emoji, bio: bio || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMember(id) {
  const { data, error } = await db()
    .from('members')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function getMemberByPseudo(pseudo) {
  const { data } = await db()
    .from('members')
    .select('*')
    .eq('pseudo', pseudo)
    .single();
  return data;
}

export async function getAllMembers() {
  const { data, error } = await db()
    .from('members')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function updateMember(id, fields) {
  const { data, error } = await db()
    .from('members')
    .update(fields)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function checkPseudoAvailable(pseudo) {
  const { count } = await db()
    .from('members')
    .select('id', { count: 'exact', head: true })
    .eq('pseudo', pseudo);
  return count === 0;
}
