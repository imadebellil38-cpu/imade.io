import { getClient } from '../lib/supabase.js';

const db = () => getClient();

export async function getGoalsForMember(memberId) {
  const { data, error } = await db()
    .from('goals')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createGoal(goal) {
  const { data, error } = await db()
    .from('goals')
    .insert(goal)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateGoal(id, fields) {
  const { data, error } = await db()
    .from('goals')
    .update(fields)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteGoal(id) {
  const { error } = await db()
    .from('goals')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
