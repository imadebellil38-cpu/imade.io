import { getClient } from '../lib/supabase.js';
import { isDueToday } from '../lib/dates.js';

const db = () => getClient();

export async function createHabit({ member_id, name, icon, color, frequency }) {
  const { data: maxOrder } = await db()
    .from('habits')
    .select('sort_order')
    .eq('member_id', member_id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .single();

  const sort_order = (maxOrder?.sort_order ?? -1) + 1;

  const { data, error } = await db()
    .from('habits')
    .insert({ member_id, name, icon: icon || '✅', color: color || '#00FF88', frequency: frequency || 'daily', sort_order })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getHabitsForMember(memberId) {
  const { data, error } = await db()
    .from('habits')
    .select('*')
    .eq('member_id', memberId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getTodayHabits(memberId) {
  const habits = await getHabitsForMember(memberId);
  return habits.filter(h => isDueToday(h.frequency));
}

export async function updateHabit(id, fields) {
  const { data, error } = await db()
    .from('habits')
    .update(fields)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deactivateHabit(id) {
  return updateHabit(id, { is_active: false });
}

export async function reorderHabits(memberId, orderedIds) {
  const promises = orderedIds.map((id, i) =>
    db().from('habits').update({ sort_order: i }).eq('id', id)
  );
  await Promise.all(promises);
}
