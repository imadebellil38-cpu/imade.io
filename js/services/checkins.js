import { getClient } from '../lib/supabase.js';
import { today } from '../lib/dates.js';

const db = () => getClient();

export async function checkin({ habit_id, member_id, date, note }) {
  const { data, error } = await db()
    .from('checkins')
    .upsert(
      { habit_id, member_id, date: date || today(), note: note || null },
      { onConflict: 'habit_id,date' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uncheckin(habit_id, date) {
  const { error } = await db()
    .from('checkins')
    .delete()
    .eq('habit_id', habit_id)
    .eq('date', date || today());
  if (error) throw error;
}

export async function getTodayCheckins(memberId) {
  const { data, error } = await db()
    .from('checkins')
    .select('*')
    .eq('member_id', memberId)
    .eq('date', today());
  if (error) throw error;
  return data || [];
}

export async function getCheckinsForRange(memberId, startDate, endDate) {
  const { data, error } = await db()
    .from('checkins')
    .select('*')
    .eq('member_id', memberId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getCheckinsForHabit(habitId, startDate, endDate) {
  const { data, error } = await db()
    .from('checkins')
    .select('*')
    .eq('habit_id', habitId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getAllCheckins(memberId) {
  const { data, error } = await db()
    .from('checkins')
    .select('*')
    .eq('member_id', memberId)
    .order('date', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getAllCheckinsGlobal() {
  const { data, error } = await db()
    .from('checkins')
    .select('*')
    .order('date', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getRecentCheckinsAll(limit = 50) {
  const { data, error } = await db()
    .from('checkins')
    .select('*, members(pseudo, avatar_emoji), habits(name, icon, color)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}
