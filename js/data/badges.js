export const BADGES = [
  { id: 'graine', name: 'Graine', emoji: '🌱', description: 'Premier check', condition: (s) => s.totalCheckins >= 1 },
  { id: 'regulier', name: 'Régulier', emoji: '📅', description: '7 jours consécutifs', condition: (s) => s.maxStreak >= 7 },
  { id: 'en_feu', name: 'En feu', emoji: '🔥', description: 'Streak de 14 jours', condition: (s) => s.maxStreak >= 14 },
  { id: 'electrique', name: 'Électrique', emoji: '⚡', description: 'Streak de 30 jours', condition: (s) => s.maxStreak >= 30 },
  { id: 'indestructible', name: 'Indestructible', emoji: '💀', description: 'Streak de 90 jours', condition: (s) => s.maxStreak >= 90 },
  { id: 'perfectionniste', name: 'Perfectionniste', emoji: '✨', description: '10 journées parfaites', condition: (s) => s.perfectDays >= 10 },
  { id: 'empereur', name: 'Empereur', emoji: '👑', description: '#1 au classement', condition: (s) => s.leaderboardRank === 1 },
  { id: 'legende', name: 'Légende', emoji: '🏆', description: '1000 points', condition: (s) => s.totalPoints >= 1000 },
  { id: 'challenger', name: 'Challenger', emoji: '⚔️', description: 'Terminer un défi', condition: (s) => s.completedChallenges >= 1 },
];
