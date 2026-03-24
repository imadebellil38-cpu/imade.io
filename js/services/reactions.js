import { getClient } from '../lib/supabase.js';

const db = () => getClient();

export async function addReaction({ from_member_id, to_member_id, checkin_id, emoji }) {
  const { data, error } = await db()
    .from('reactions')
    .insert({ from_member_id, to_member_id, checkin_id, emoji })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getReactionsForCheckin(checkinId) {
  const { data, error } = await db()
    .from('reactions')
    .select('*, members:from_member_id(pseudo, avatar_emoji)')
    .eq('checkin_id', checkinId);
  if (error) throw error;
  return data || [];
}

export async function getReactionsForMember(memberId) {
  const { data, error } = await db()
    .from('reactions')
    .select('*, members:from_member_id(pseudo, avatar_emoji)')
    .eq('to_member_id', memberId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data || [];
}

export async function removeReaction(reactionId) {
  const { error } = await db()
    .from('reactions')
    .delete()
    .eq('id', reactionId);
  if (error) throw error;
}
