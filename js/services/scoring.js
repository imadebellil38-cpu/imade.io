import { getAllCheckins, getAllCheckinsGlobal } from './checkins.js';
import { getHabitsForMember, getAllHabitsGlobal } from './habits.js';
import { getAllMembers } from './members.js';
import { today, daysAgo, dateRange, isDueOnDate } from '../lib/dates.js';
import { POINTS, RANK_TIERS } from '../config.js';

export async function computeStreaks(memberId) {
  const habits = await getHabitsForMember(memberId);
  const checkins = await getAllCheckins(memberId);
  const result = {};

  for (const habit of habits) {
    const habitCheckins = new Set(
      checkins.filter(c => c.habit_id === habit.id).map(c => c.date)
    );

    let currentStreak = 0;
    let maxStreak = 0;
    let streak = 0;
    let d = new Date(today());

    // Walk backwards from today
    for (let i = 0; i < 365; i++) {
      const dateStr = d.toLocaleDateString('en-CA');
      if (!isDueOnDate(habit.frequency, dateStr)) {
        d.setDate(d.getDate() - 1);
        continue;
      }
      if (habitCheckins.has(dateStr)) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        if (i === 0) {
          // Today not checked yet, don't break streak, just skip
          d.setDate(d.getDate() - 1);
          continue;
        }
        break;
      }
      d.setDate(d.getDate() - 1);
    }
    currentStreak = streak;

    result[habit.id] = { currentStreak, maxStreak, habitName: habit.name };
  }

  return result;
}

export async function computePoints(memberId) {
  const habits = await getHabitsForMember(memberId);
  const checkins = await getAllCheckins(memberId);

  const habitPoints = checkins.length * POINTS.CHECKIN;

  // Perfect days
  const checkinsByDate = {};
  for (const c of checkins) {
    if (!checkinsByDate[c.date]) checkinsByDate[c.date] = new Set();
    checkinsByDate[c.date].add(c.habit_id);
  }

  let perfectDays = 0;
  for (const [date, habitIds] of Object.entries(checkinsByDate)) {
    const dueHabits = habits.filter(h => isDueOnDate(h.frequency, date));
    if (dueHabits.length > 0 && dueHabits.every(h => habitIds.has(h.id))) {
      perfectDays++;
    }
  }
  const perfectDayPoints = perfectDays * POINTS.PERFECT_DAY;

  // Streak points
  const streaks = await computeStreaks(memberId);
  let totalStreakDays = 0;
  let maxStreak = 0;
  for (const s of Object.values(streaks)) {
    totalStreakDays += s.currentStreak;
    maxStreak = Math.max(maxStreak, s.maxStreak);
  }
  const streakPoints = totalStreakDays * POINTS.STREAK_DAY;

  const total = habitPoints + perfectDayPoints + streakPoints;

  return {
    total,
    habitPoints,
    perfectDayPoints,
    streakPoints,
    perfectDays,
    totalCheckins: checkins.length,
    maxStreak,
    completedChallenges: 0,
  };
}

export function getRankTier(points) {
  let tier = RANK_TIERS[0];
  for (const t of RANK_TIERS) {
    if (points >= t.minPoints) tier = t;
  }
  return tier;
}

// In-memory versions that accept pre-fetched data (no DB calls)
function computeStreaksFromData(memberHabits, memberCheckins) {
  const result = {};

  for (const habit of memberHabits) {
    const habitCheckins = new Set(
      memberCheckins.filter(c => c.habit_id === habit.id).map(c => c.date)
    );

    let currentStreak = 0;
    let maxStreak = 0;
    let streak = 0;
    let d = new Date(today());

    for (let i = 0; i < 365; i++) {
      const dateStr = d.toLocaleDateString('en-CA');
      if (!isDueOnDate(habit.frequency, dateStr)) {
        d.setDate(d.getDate() - 1);
        continue;
      }
      if (habitCheckins.has(dateStr)) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        if (i === 0) {
          d.setDate(d.getDate() - 1);
          continue;
        }
        break;
      }
      d.setDate(d.getDate() - 1);
    }
    currentStreak = streak;

    result[habit.id] = { currentStreak, maxStreak, habitName: habit.name };
  }

  return result;
}

function computePointsFromData(memberHabits, memberCheckins) {
  const habitPoints = memberCheckins.length * POINTS.CHECKIN;

  // Perfect days
  const checkinsByDate = {};
  for (const c of memberCheckins) {
    if (!checkinsByDate[c.date]) checkinsByDate[c.date] = new Set();
    checkinsByDate[c.date].add(c.habit_id);
  }

  let perfectDays = 0;
  for (const [date, habitIds] of Object.entries(checkinsByDate)) {
    const dueHabits = memberHabits.filter(h => isDueOnDate(h.frequency, date));
    if (dueHabits.length > 0 && dueHabits.every(h => habitIds.has(h.id))) {
      perfectDays++;
    }
  }
  const perfectDayPoints = perfectDays * POINTS.PERFECT_DAY;

  // Streak points
  const streaks = computeStreaksFromData(memberHabits, memberCheckins);
  let totalStreakDays = 0;
  let maxStreak = 0;
  for (const s of Object.values(streaks)) {
    totalStreakDays += s.currentStreak;
    maxStreak = Math.max(maxStreak, s.maxStreak);
  }
  const streakPoints = totalStreakDays * POINTS.STREAK_DAY;

  const total = habitPoints + perfectDayPoints + streakPoints;

  return {
    total,
    habitPoints,
    perfectDayPoints,
    streakPoints,
    perfectDays,
    totalCheckins: memberCheckins.length,
    maxStreak,
    completedChallenges: 0,
  };
}

export async function computeLeaderboard() {
  // 3 queries total instead of 100+
  const [members, allCheckins, allHabits] = await Promise.all([
    getAllMembers(),
    getAllCheckinsGlobal(),
    getAllHabitsGlobal(),
  ]);

  // Group by member_id in memory
  const checkinsByMember = {};
  for (const c of allCheckins) {
    if (!checkinsByMember[c.member_id]) checkinsByMember[c.member_id] = [];
    checkinsByMember[c.member_id].push(c);
  }

  const habitsByMember = {};
  for (const h of allHabits) {
    if (!habitsByMember[h.member_id]) habitsByMember[h.member_id] = [];
    habitsByMember[h.member_id].push(h);
  }

  const entries = [];
  for (const member of members) {
    const memberHabits = habitsByMember[member.id] || [];
    const memberCheckins = checkinsByMember[member.id] || [];
    const points = computePointsFromData(memberHabits, memberCheckins);
    const tier = getRankTier(points.total);
    entries.push({
      member,
      points: points.total,
      breakdown: points,
      tier,
    });
  }

  entries.sort((a, b) => b.points - a.points);
  entries.forEach((e, i) => { e.rank = i + 1; });

  return entries;
}

export async function getDailyScore(memberId, habits, checkins) {
  const total = habits.length;
  const checked = checkins.length;
  const percentage = total > 0 ? Math.round((checked / total) * 100) : 0;
  return { checked, total, percentage, isPerfect: total > 0 && checked === total };
}

export async function resolveBadges(memberId, leaderboardRank) {
  const points = await computePoints(memberId);
  const stats = {
    ...points,
    leaderboardRank: leaderboardRank || 999,
  };

  const { BADGES } = await import('../data/badges.js');
  return BADGES.map(badge => ({
    ...badge,
    earned: badge.condition(stats),
  }));
}

export async function getFirstCheckinDate(memberId) {
  const checkins = await getAllCheckins(memberId);
  if (!checkins.length) return null;
  return checkins.reduce((min, c) => c.date < min ? c.date : min, checkins[0].date);
}
