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
import { computeStreaks, computePoints, resolveBadges, getRankTier, getDailyScore } from '../services/scoring.js';
import { today, daysAgo, dateRange, isDueOnDate } from '../lib/dates.js';
import { HABIT_COLORS } from '../config.js';
import { HABIT_CATEGORIES } from '../data/habits-catalog.js';
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

  const rank = getRankTier(points.total);
  const badges = await resolveBadges(memberId, 1);

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
        <div class="profile-avatar-wrap" id="avatar-upload-trigger" style="position:relative;cursor:pointer;display:inline-block">
          ${renderAvatar(member.avatar_emoji, 'xl', 'profile-avatar')}
          <div class="avatar-edit-badge">📷</div>
          <input type="file" id="avatar-file-input" accept="image/*" style="display:none">
        </div>
        <h2 class="profile-pseudo">${member.pseudo}</h2>
        <span class="profile-rank">${rank.emoji} ${rank.name}</span>
        ${member.bio ? `<p class="profile-bio">${member.bio}</p>` : ''}
        <button class="btn btn-ghost btn-sm mt-sm" id="edit-profile-btn">Modifier profil</button>
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
          <p class="profile-stat-label">30 jours</p>
        </div>
      </div>

      <div class="profile-section">
        <h3 class="profile-section-title">Évolution (30 jours)</h3>
        <div class="chart-container">
          <canvas class="chart-canvas" id="evolution-chart"></canvas>
        </div>
      </div>

      <div class="profile-section">
        <div class="section-header">
          <h3 class="section-title">Mes Habitudes</h3>
          <button class="btn btn-secondary btn-sm" id="add-habit-btn">+ Ajouter</button>
        </div>
        <div id="habits-manage">
          ${habits.map(h => {
            const streak = streaks[h.id]?.currentStreak || 0;
            return `
              <div class="manage-habit-item" data-habit-id="${h.id}">
                <span class="manage-habit-icon">${h.icon}</span>
                <span class="manage-habit-name">${h.name}</span>
                ${streak > 0 ? `<span style="font-size:0.75rem;color:var(--accent-gold)">🔥${streak}j</span>` : ''}
                <div class="manage-habit-actions">
                  <button class="manage-habit-btn edit-habit-btn">✏️</button>
                  <button class="manage-habit-btn danger delete-habit-btn">🗑️</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div id="heatmap-container"></div>

      <div class="profile-section">
        <div class="section-header">
          <h3 class="profile-section-title">Badges</h3>
          <button class="btn btn-ghost btn-sm" id="view-achievements-btn">Voir tout →</button>
        </div>
        <div class="badges-grid">
          ${badges.map(b => `
            <div class="badge-item ${b.earned ? 'earned' : 'locked'}">
              <p class="badge-emoji">${b.emoji}</p>
              <p class="badge-name">${b.name}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="text-center mt-lg mb-lg" style="display:flex;flex-direction:column;gap:var(--space-sm);align-items:center">
        <button class="btn btn-ghost btn-sm" id="export-btn">📥 Exporter CSV</button>
        <button class="btn btn-danger btn-sm" id="logout-btn" style="opacity:0.7">🚪 Se déconnecter</button>
      </div>
    </div>
  `);

  // Avatar photo upload
  on($('#avatar-upload-trigger', container), 'click', () => {
    $('#avatar-file-input', container)?.click();
  });
  on($('#avatar-file-input', container), 'change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 500000) { showToast('Photo trop lourde (max 500KB)', 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      // Resize to 200x200 for storage
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 200, 200);
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        Store.setProfilePhoto(base64);
        showToast('Photo de profil mise à jour');
        render(container);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  // Chart
  const chartCanvas = $('#evolution-chart', container);
  if (chartCanvas) {
    setTimeout(() => renderChart(chartCanvas, dailyData), 100);
  }

  // Heatmap
  renderHeatmap($('#heatmap-container', container), checkins90, habits, { mode: 'full', days: 90 });

  // Edit profile
  on($('#edit-profile-btn', container), 'click', () => {
    const currentPhoto = Store.getProfilePhoto();
    const formEl = document.createElement('div');
    formEl.innerHTML = `
      <div class="modal-handle"></div>
      <div style="display:flex;flex-direction:column;gap:var(--space-md)">
        <div style="text-align:center">
          <label class="label">Photo de profil</label>
          <div id="photo-preview" style="width:80px;height:80px;border-radius:50%;margin:0 auto var(--space-sm);background:var(--bg-elevated);display:flex;align-items:center;justify-content:center;font-size:2.5rem;cursor:pointer;overflow:hidden;border:2px solid var(--accent-primary);${currentPhoto ? 'background-image:url(' + currentPhoto + ');background-size:cover;background-position:center;font-size:0' : ''}">
            ${currentPhoto ? '' : (member.avatar_emoji || '😀')}
          </div>
          <button class="btn btn-ghost btn-sm" id="photo-upload-btn" style="margin:0 auto">📷 Changer la photo</button>
          ${currentPhoto ? '<button class="btn btn-ghost btn-sm" id="photo-remove-btn" style="margin:0 auto;color:var(--accent-red)">Supprimer la photo</button>' : ''}
          <input type="file" id="modal-photo-input" accept="image/*" style="display:none">
        </div>
        <div><label class="label">Pseudo</label><input class="input" id="edit-pseudo" value="${member.pseudo}"></div>
        <div><label class="label">Bio</label><input class="input" id="edit-bio" value="${member.bio || ''}" placeholder="Une petite bio..."></div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="edit-cancel">Annuler</button>
          <button class="btn btn-primary" id="edit-save">Sauver</button>
        </div>
        <div style="border-top:1px solid rgba(255,255,255,0.06);padding-top:var(--space-md);text-align:center">
          <button class="btn btn-danger btn-sm" id="modal-logout-btn">🚪 Se déconnecter</button>
        </div>
      </div>
    `;
    const modal = showModal({ title: 'Modifier Profil', content: formEl });

    // Photo upload
    on($('#photo-upload-btn', formEl), 'click', () => {
      $('#modal-photo-input', formEl)?.click();
    });
    on($('#photo-preview', formEl), 'click', () => {
      $('#modal-photo-input', formEl)?.click();
    });
    on($('#modal-photo-input', formEl), 'change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 2000000) { showToast('Photo trop lourde (max 2MB)', 'error'); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = 200;
          canvas.height = 200;
          const ctx = canvas.getContext('2d');
          const size = Math.min(img.width, img.height);
          const sx = (img.width - size) / 2;
          const sy = (img.height - size) / 2;
          ctx.drawImage(img, sx, sy, size, size, 0, 0, 200, 200);
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          Store.setProfilePhoto(base64);
          const preview = $('#photo-preview', formEl);
          if (preview) {
            preview.style.backgroundImage = `url(${base64})`;
            preview.style.backgroundSize = 'cover';
            preview.style.backgroundPosition = 'center';
            preview.style.fontSize = '0';
            preview.textContent = '';
          }
          showToast('Photo mise à jour');
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

    // Remove photo
    const removeBtn = $('#photo-remove-btn', formEl);
    if (removeBtn) {
      on(removeBtn, 'click', () => {
        Store.setProfilePhoto(null);
        const preview = $('#photo-preview', formEl);
        if (preview) {
          preview.style.backgroundImage = '';
          preview.style.fontSize = '2.5rem';
          preview.textContent = member.avatar_emoji || '😀';
        }
        removeBtn.remove();
        showToast('Photo supprimée');
      });
    }

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
        showToast('Erreur', 'error');
      }
    });

    // Logout in modal
    on($('#modal-logout-btn', formEl), 'click', () => {
      if (confirm('Te déconnecter ? Tes données locales seront perdues.')) {
        Store.clear();
        modal.close();
        location.hash = '#onboarding';
        location.reload();
      }
    });
  });

  // View achievements
  on($('#view-achievements-btn', container), 'click', () => navigate('#achievements'));

  // Add habit (with catalog)
  on($('#add-habit-btn', container), 'click', () => {
    const allCatalog = [];
    for (const cat of HABIT_CATEGORIES) {
      for (const h of cat.habits) {
        if (!habits.find(eh => eh.name === h.name)) {
          allCatalog.push(h);
        }
      }
    }

    const formEl = document.createElement('div');
    formEl.innerHTML = `
      <div class="modal-handle"></div>
      <div style="display:flex;flex-direction:column;gap:var(--space-md)">
        ${allCatalog.length > 0 ? `
          <div>
            <label class="label">Depuis le catalogue</label>
            <div style="max-height:200px;overflow-y:auto;display:flex;flex-direction:column;gap:4px">
              ${allCatalog.slice(0, 10).map(h => `
                <div class="habit-select-item catalog-pick" data-habit='${JSON.stringify(h)}'>
                  <span class="habit-select-icon">${h.icon}</span>
                  <span class="habit-select-name">${h.name}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div style="text-align:center;color:var(--text-muted);font-size:0.8rem">— ou —</div>
        ` : ''}
        <div><label class="label">Personnalisée</label><input class="input" id="new-habit-name" placeholder="Nom de l'habitude"></div>
        <div>
          <label class="label">Fréquence</label>
          <select class="input" id="new-habit-freq" style="padding:10px var(--space-md)">
            <option value="daily">Tous les jours</option>
            <option value="weekly_5">Lun - Ven</option>
            <option value="weekly_3">Lun, Mer, Ven</option>
            <option value="custom">Jours personnalisés</option>
          </select>
        </div>
        <div id="new-days-picker" class="day-picker hidden">
          <div class="day-picker-row">
            ${['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map((d, i) => `
              <button class="day-pick-btn" data-day="${i}">${d}</button>
            `).join('')}
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="new-cancel">Annuler</button>
          <button class="btn btn-primary" id="new-save">Créer</button>
        </div>
      </div>
    `;
    const modal = showModal({ title: 'Nouvelle Habitude', content: formEl });

    // Catalog pick
    formEl.querySelectorAll('.catalog-pick').forEach(el => {
      on(el, 'click', async () => {
        const h = JSON.parse(el.dataset.habit);
        await createHabit({ member_id: memberId, name: h.name, icon: h.icon, color: h.color, frequency: h.frequency || 'daily' });
        modal.close();
        render(container);
        showToast(`${h.icon} ${h.name} ajoutée`);
      });
    });

    // Frequency selector
    const freqSelect = $('#new-habit-freq', formEl);
    const daysPicker = $('#new-days-picker', formEl);
    on(freqSelect, 'change', () => {
      daysPicker.classList.toggle('hidden', freqSelect.value !== 'custom');
    });
    // Day toggle buttons
    daysPicker.querySelectorAll('.day-pick-btn').forEach(btn => {
      on(btn, 'click', (e) => {
        e.preventDefault();
        btn.classList.toggle('active');
      });
    });

    on($('#new-cancel', formEl), 'click', () => modal.close());
    on($('#new-save', formEl), 'click', async () => {
      const name = $('#new-habit-name', formEl).value.trim();
      if (!name) return;
      let frequency = freqSelect.value;
      if (frequency === 'custom') {
        const selectedDays = [...daysPicker.querySelectorAll('.day-pick-btn.active')]
          .map(b => b.dataset.day).join(',');
        frequency = selectedDays ? `custom:${selectedDays}` : 'daily';
      }
      await createHabit({ member_id: memberId, name, icon: '⭐', color: HABIT_COLORS[0], frequency });
      modal.close();
      render(container);
      showToast('Habitude créée');
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

      const isCustom = habit.frequency && habit.frequency.startsWith('custom:');
      const customDays = isCustom ? habit.frequency.slice(7).split(',') : [];
      const currentFreq = isCustom ? 'custom' : (habit.frequency || 'daily');

      const formEl = document.createElement('div');
      formEl.innerHTML = `
        <div class="modal-handle"></div>
        <div style="display:flex;flex-direction:column;gap:var(--space-md)">
          <div><label class="label">Nom</label><input class="input" id="edit-h-name" value="${habit.name}"></div>
          <div><label class="label">Icône</label><input class="input" id="edit-h-icon" value="${habit.icon}" maxlength="4" style="width:80px"></div>
          <div>
            <label class="label">Fréquence</label>
            <select class="input" id="edit-h-freq" style="padding:10px var(--space-md)">
              <option value="daily" ${currentFreq === 'daily' ? 'selected' : ''}>Tous les jours</option>
              <option value="weekly_5" ${currentFreq === 'weekly_5' ? 'selected' : ''}>Lun - Ven</option>
              <option value="weekly_3" ${currentFreq === 'weekly_3' ? 'selected' : ''}>Lun, Mer, Ven</option>
              <option value="custom" ${currentFreq === 'custom' ? 'selected' : ''}>Jours personnalisés</option>
            </select>
          </div>
          <div id="edit-days-picker" class="day-picker ${currentFreq !== 'custom' ? 'hidden' : ''}">
            <div class="day-picker-row">
              ${['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map((d, i) => `
                <button class="day-pick-btn ${customDays.includes(String(i)) ? 'active' : ''}" data-day="${i}">${d}</button>
              `).join('')}
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" id="edit-h-cancel">Annuler</button>
            <button class="btn btn-primary" id="edit-h-save">Sauver</button>
          </div>
        </div>
      `;
      const modal = showModal({ title: 'Modifier Habitude', content: formEl });

      const editFreqSelect = $('#edit-h-freq', formEl);
      const editDaysPicker = $('#edit-days-picker', formEl);
      on(editFreqSelect, 'change', () => {
        editDaysPicker.classList.toggle('hidden', editFreqSelect.value !== 'custom');
      });
      editDaysPicker.querySelectorAll('.day-pick-btn').forEach(btn => {
        on(btn, 'click', (e) => { e.preventDefault(); btn.classList.toggle('active'); });
      });

      on($('#edit-h-cancel', formEl), 'click', () => modal.close());
      on($('#edit-h-save', formEl), 'click', async () => {
        const name = $('#edit-h-name', formEl).value.trim();
        const icon = $('#edit-h-icon', formEl).value.trim();
        if (!name) return;
        let frequency = editFreqSelect.value;
        if (frequency === 'custom') {
          const selectedDays = [...editDaysPicker.querySelectorAll('.day-pick-btn.active')]
            .map(b => b.dataset.day).join(',');
          frequency = selectedDays ? `custom:${selectedDays}` : 'daily';
        }
        await updateHabit(habitId, { name, icon: icon || habit.icon, frequency });
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
    a.download = `empiretrack-${member.pseudo}-export.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exporté');
  });

  // Logout
  on($('#logout-btn', container), 'click', () => {
    if (confirm('Te déconnecter ? Tes données locales seront perdues.')) {
      Store.clear();
      location.hash = '#onboarding';
      location.reload();
    }
  });
}
