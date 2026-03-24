import { html, $, on } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { showNavbar } from '../components/navbar.js';
import { renderAvatar } from '../components/avatar.js';
import { renderHeatmap } from '../components/heatmap.js';
import { renderChart } from '../components/chart.js';
import { showModal } from '../components/modal.js';
import { showToast } from '../components/toast.js';
import { getMember, updateMember } from '../services/members.js';
import { getHabitsForMember, createHabit, updateHabit, deactivateHabit } from '../services/habits.js';
import { getCheckinsForRange, getAllCheckins } from '../services/checkins.js';
import { computeStreaks, computePoints, resolveBadges, computeLeaderboard, getDailyScore } from '../services/scoring.js';
import { today, daysAgo, dateRange, isDueOnDate } from '../lib/dates.js';
import { HABIT_COLORS } from '../config.js';
import { navigate } from '../router.js';

export function destroy() {}

export async function render(container) {
  showNavbar();
  const memberId = Store.getMemberId();
  if (!memberId) return;

  html(container, `<div class="page"><div class="text-center mt-md"><div class="loader" style="margin:0 auto"></div></div></div>`);

  const member = await getMember(memberId);
  if (!member) {
    Store.clear();
    navigate('#onboarding');
    return;
  }

  const [habits, checkins90, streaks, points] = await Promise.all([
    getHabitsForMember(memberId),
    getCheckinsForRange(memberId, daysAgo(89), today()),
    computeStreaks(memberId),
    computePoints(memberId),
  ]);

  const leaderboard = await computeLeaderboard();
  const myEntry = leaderboard.find(e => e.member.id === memberId);
  const badges = await resolveBadges(memberId, myEntry?.rank);

  // 30-day chart data
  const range30 = dateRange(daysAgo(29), today());
  const checkins30 = checkins90.filter(c => c.date >= daysAgo(29));
  const dailyData = range30.map(date => {
    const dueHabits = habits.filter(h => isDueOnDate(h.frequency, date));
    const dayCheckins = checkins30.filter(c => c.date === date);
    const percentage = dueHabits.length > 0 ? Math.round((dayCheckins.length / dueHabits.length) * 100) : 0;
    return { date, percentage };
  });

  let maxStreak = 0;
  for (const s of Object.values(streaks)) maxStreak = Math.max(maxStreak, s.maxStreak);
  const completionRate = habits.length > 0 ? Math.round((checkins30.length / (habits.length * 30)) * 100) : 0;

  html(container, `
    <div class="page">
      <div class="profile-header">
        ${renderAvatar(member.avatar_emoji, 'xl', 'profile-avatar')}
        <h2 class="profile-pseudo">${member.pseudo}</h2>
        ${member.bio ? `<p class="profile-bio">${member.bio}</p>` : ''}
        <button class="btn btn-secondary btn-sm mt-md" id="edit-profile-btn">Modifier profil</button>
      </div>

      <div class="profile-stats">
        <div class="profile-stat">
          <p class="profile-stat-value">${points.total}</p>
          <p class="profile-stat-label">Points</p>
        </div>
        <div class="profile-stat">
          <p class="profile-stat-value">${maxStreak}</p>
          <p class="profile-stat-label">Max Streak</p>
        </div>
        <div class="profile-stat">
          <p class="profile-stat-value">${completionRate}%</p>
          <p class="profile-stat-label">30j</p>
        </div>
      </div>

      <div class="profile-section">
        <h3 class="profile-section-title">Évolution (30 jours)</h3>
        <div class="chart-container">
          <canvas class="chart-canvas" id="evolution-chart"></canvas>
        </div>
      </div>

      <div class="profile-section">
        <div class="flex justify-between items-center mb-md">
          <h3 class="profile-section-title" style="margin:0">Mes Habitudes</h3>
          <button class="btn btn-secondary btn-sm" id="add-habit-btn">+ Ajouter</button>
        </div>
        <div id="habits-manage">
          ${habits.map(h => {
            const streak = streaks[h.id]?.currentStreak || 0;
            return `
              <div class="manage-habit-item" data-habit-id="${h.id}">
                <div class="profile-habit-dot" style="background:${h.color}"></div>
                <span>${h.icon}</span>
                <span class="profile-habit-name" style="flex:1">${h.name}</span>
                ${streak > 0 ? `<span style="font-size:0.75rem;color:var(--text-secondary)">🔥${streak}j</span>` : ''}
                <div class="manage-habit-actions">
                  <button class="manage-habit-btn edit-habit-btn" title="Modifier">✏️</button>
                  <button class="manage-habit-btn delete-habit-btn" title="Supprimer">🗑️</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div id="heatmap-container"></div>

      <div class="profile-section">
        <h3 class="profile-section-title">Badges</h3>
        <div class="badges-grid">
          ${badges.map(b => `
            <div class="badge-item ${b.earned ? 'earned' : 'locked'}">
              <p class="badge-emoji">${b.emoji}</p>
              <p class="badge-name">${b.name}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="text-center mt-lg mb-lg">
        <button class="btn btn-secondary btn-sm" id="export-btn">📥 Exporter CSV</button>
      </div>
    </div>
  `);

  // Chart
  const chartCanvas = $('#evolution-chart', container);
  if (chartCanvas) {
    setTimeout(() => renderChart(chartCanvas, dailyData), 100);
  }

  // Heatmap
  renderHeatmap($('#heatmap-container', container), checkins90, habits, { mode: 'full', days: 90 });

  // Edit profile
  on($('#edit-profile-btn', container), 'click', () => {
    const formEl = document.createElement('div');
    formEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:var(--space-md)">
        <div><label class="label">Pseudo</label><input class="input" id="edit-pseudo" value="${member.pseudo}"></div>
        <div><label class="label">Bio</label><input class="input" id="edit-bio" value="${member.bio || ''}"></div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="edit-cancel">Annuler</button>
          <button class="btn btn-primary" id="edit-save">Sauver</button>
        </div>
      </div>
    `;
    const modal = showModal({ title: 'Modifier Profil', content: formEl });
    on($('#edit-cancel', formEl), 'click', () => modal.close());
    on($('#edit-save', formEl), 'click', async () => {
      const newPseudo = $('#edit-pseudo', formEl).value.trim();
      const newBio = $('#edit-bio', formEl).value.trim();
      if (!newPseudo) return;
      try {
        await updateMember(memberId, { pseudo: newPseudo, bio: newBio || null });
        Store.setPseudo(newPseudo);
        modal.close();
        render(container);
        showToast('Profil mis à jour');
      } catch (err) {
        showToast('Erreur: ' + err.message, 'error');
      }
    });
  });

  // Add habit
  on($('#add-habit-btn', container), 'click', () => {
    const formEl = document.createElement('div');
    formEl.innerHTML = `
      <div style="display:flex;flex-direction:column;gap:var(--space-md)">
        <div><label class="label">Nom</label><input class="input" id="new-habit-name" placeholder="Nom de l'habitude"></div>
        <div><label class="label">Icône</label><input class="input" id="new-habit-icon" value="✅" maxlength="4" style="width:60px"></div>
        <div>
          <label class="label">Couleur</label>
          <div class="habit-colors" id="new-habit-colors">
            ${HABIT_COLORS.map((c, i) => `<div class="color-swatch ${i === 0 ? 'selected' : ''}" data-color="${c}" style="background:${c}"></div>`).join('')}
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="new-cancel">Annuler</button>
          <button class="btn btn-primary" id="new-save">Créer</button>
        </div>
      </div>
    `;
    const modal = showModal({ title: 'Nouvelle Habitude', content: formEl });
    let selColor = HABIT_COLORS[0];

    on($('#new-habit-colors', formEl), 'click', (e) => {
      const sw = e.target.closest('.color-swatch');
      if (sw) {
        selColor = sw.dataset.color;
        formEl.querySelectorAll('.color-swatch').forEach(el => el.classList.remove('selected'));
        sw.classList.add('selected');
      }
    });

    on($('#new-cancel', formEl), 'click', () => modal.close());
    on($('#new-save', formEl), 'click', async () => {
      const name = $('#new-habit-name', formEl).value.trim();
      const icon = $('#new-habit-icon', formEl).value.trim() || '✅';
      if (!name) return;
      try {
        await createHabit({ member_id: memberId, name, icon, color: selColor, frequency: 'daily' });
        modal.close();
        render(container);
        showToast('Habitude créée');
      } catch (err) {
        showToast('Erreur', 'error');
      }
    });
  });

  // Delete habit
  container.querySelectorAll('.delete-habit-btn').forEach(btn => {
    on(btn, 'click', async (e) => {
      e.stopPropagation();
      const item = btn.closest('.manage-habit-item');
      const habitId = item.dataset.habitId;
      if (confirm('Désactiver cette habitude ?')) {
        await deactivateHabit(habitId);
        render(container);
        showToast('Habitude désactivée');
      }
    });
  });

  // Edit habit
  container.querySelectorAll('.edit-habit-btn').forEach(btn => {
    on(btn, 'click', async (e) => {
      e.stopPropagation();
      const item = btn.closest('.manage-habit-item');
      const habitId = item.dataset.habitId;
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const formEl = document.createElement('div');
      formEl.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:var(--space-md)">
          <div><label class="label">Nom</label><input class="input" id="edit-h-name" value="${habit.name}"></div>
          <div><label class="label">Icône</label><input class="input" id="edit-h-icon" value="${habit.icon}" maxlength="4" style="width:60px"></div>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="edit-h-cancel">Annuler</button>
            <button class="btn btn-primary" id="edit-h-save">Sauver</button>
          </div>
        </div>
      `;
      const modal = showModal({ title: 'Modifier Habitude', content: formEl });
      on($('#edit-h-cancel', formEl), 'click', () => modal.close());
      on($('#edit-h-save', formEl), 'click', async () => {
        const name = $('#edit-h-name', formEl).value.trim();
        const icon = $('#edit-h-icon', formEl).value.trim();
        if (!name) return;
        await updateHabit(habitId, { name, icon: icon || habit.icon });
        modal.close();
        render(container);
        showToast('Habitude modifiée');
      });
    });
  });

  // Export CSV
  on($('#export-btn', container), 'click', async () => {
    const allCheckins = await getAllCheckins(memberId);
    const csvRows = ['date,habit_id,note'];
    for (const c of allCheckins) {
      csvRows.push(`${c.date},${c.habit_id},${(c.note || '').replace(/,/g, ';')}`);
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `empire-${member.pseudo}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exporté');
  });
}
