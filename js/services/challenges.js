import { getClient } from '../lib/supabase.js';
import { today } from '../lib/dates.js';

const db = () => getClient();

export async function createChallenge({ title, description, created_by, start_date, end_date, habit_name }) {
  const { data, error } = await db()
    .from('challenges')
    .insert({ title, description, created_by, start_date, end_date, habit_name })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getActiveChallenges() {
  const { data, error } = await db()
    .from('challenges')
    .select('*, challenge_participants(member_id, checkin_count, members(pseudo, avatar_emoji))')
    .eq('is_active', true)
    .gte('end_date', today())
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getPastChallenges() {
  const { data, error } = await db()
    .from('challenges')
    .select('*, challenge_participants(member_id, checkin_count, members(pseudo, avatar_emoji))')
    .lt('end_date', today())
    .order('end_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function joinChallenge(challengeId, memberId) {
  const { data, error } = await db()
    .from('challenge_participants')
    .insert({ challenge_id: challengeId, member_id: memberId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getChallengeParticipants(challengeId) {
  const { data, error } = await db()
    .from('challenge_participants')
    .select('*, members(pseudo, avatar_emoji)')
    .eq('challenge_id', challengeId)
    .order('checkin_count', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function incrementCheckinCount(challengeId, memberId) {
  const { data: current } = await db()
    .from('challenge_participants')
    .select('checkin_count')
    .eq('challenge_id', challengeId)
    .eq('member_id', memberId)
    .single();

  if (!current) return;

  const { error } = await db()
    .from('challenge_participants')
    .update({ checkin_count: (current.checkin_count || 0) + 1 })
    .eq('challenge_id', challengeId)
    .eq('member_id', memberId);
  if (error) throw error;
}
