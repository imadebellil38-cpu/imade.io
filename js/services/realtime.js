import { getClient } from '../lib/supabase.js';

let channels = [];

export function subscribeToCheckins(callback) {
  const channel = getClient()
    .channel('checkins-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'checkins' }, callback)
    .subscribe();
  channels.push(channel);
  return channel;
}

export function subscribeToReactions(callback) {
  const channel = getClient()
    .channel('reactions-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, callback)
    .subscribe();
  channels.push(channel);
  return channel;
}

export function subscribeToChallenges(callback) {
  const channel = getClient()
    .channel('challenges-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'challenge_participants' }, callback)
    .subscribe();
  channels.push(channel);
  return channel;
}

export function unsubscribeAll() {
  channels.forEach(ch => getClient().removeChannel(ch));
  channels = [];
}

export function removeChannel(channel) {
  getClient().removeChannel(channel);
  channels = channels.filter(c => c !== channel);
}
