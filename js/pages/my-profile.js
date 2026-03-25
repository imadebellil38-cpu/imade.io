import { html, $, on, escapeHtml } from '../lib/dom.js';
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
import { processAndSavePhoto, removePhoto } from '../lib/photo.js';
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
          ${renderAvatar(member.avatar_emoji, 'xl', 'profile-avatar', memberId, member)}
          <div class="avatar-edit-badge">📷</div>
          <input type="file" id="avatar-file-input" accept="image/*" style="display:none">
        </div>
        <h2 class="profile-pseudo">${escapeHtml(member.pseudo)}</h2>
        <span class="profile-rank">${rank.emoji} ${rank.name}</span>
        ${member.bio ? `<p class="profile-bio">${escapeHtml(member.bio)}</p>` : ''}
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
          <button class="btn btn-primary btn-sm" id="add-habit-btn" style="box-shadow: 0 2px 12px rgba(0,255,136,0.3)">+ Ajouter</button>
        </div>
        <div id="habits-manage">
          ${habits.map(h => {
            const streak = streaks[h.id]?.currentStreak || 0;
            return `
              <div class="manage-habit-item" data-habit-id="${h.id}">
                <span class="manage-habit-icon">${escapeHtml(h.icon)}</span>
                <span class="manage-habit-name">${escapeHtml(h.name)}</span>
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
    processAndSavePhoto(file, memberId, updateMember, {
      onDone: () => render(container),
    });
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
        <div><label class="label">Pseudo</label><input class="input" id="edit-pseudo" value="${escapeHtml(member.pseudo)}"></div>
        <div><label class="label">Bio</label><input class="input" id="edit-bio" value="${escapeHtml(member.bio || '')}" placeholder="Une petite bio..."></div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="edit-cancel">Annuler</button>
          <button class="btn btn-primary" id="edit-save">Sauver</button>
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
      processAndSavePhoto(file, memberId, updateMember, {
        onDone: (base64) => {
          const preview = $('#photo-preview', formEl);
          if (preview) {
            preview.style.backgroundImage = `url(${base64})`;
            preview.style.backgroundSize = 'cover';
            preview.style.backgroundPosition = 'center';
            preview.style.fontSize = '0';
            preview.textContent = '';
          }
        },
      });
    });

    // Remove photo
    const removeBtn = $('#photo-remove-btn', formEl);
    if (removeBtn) {
      on(removeBtn, 'click', () => {
        removePhoto(memberId, updateMember, {
          onDone: () => {
            const preview = $('#photo-preview', formEl);
            if (preview) {
              preview.style.backgroundImage = '';
              preview.style.fontSize = '2.5rem';
              preview.textContent = member.avatar_emoji || '😀';
            }
            removeBtn.remove();
          },
        });
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

  });

  // View achievements
  on($('#view-achievements-btn', container), 'click', () => navigate('#achievements'));

  // Add habit (with full catalog)
  on($('#add-habit-btn', container), 'click', () => {
    const existingNames = new Set(habits.map(h => h.name));

    const formEl = document.createElement('div');
    formEl.innerHTML = `
      <div class="modal-handle"></div>
      <div class="catalog-modal">
        <div class="catalog-search-wrap">
          <input class="input catalog-search" id="catalog-search" placeholder="🔍 Rechercher une habitude..." autocomplete="off">
        </div>
        <div class="catalog-tabs" id="catalog-tabs">
          <button class="catalog-tab active" data-tab="all">Tout</button>
          ${HABIT_CATEGORIES.map(cat => `
            <button class="catalog-tab" data-tab="${cat.id}">${cat.icon} ${cat.name}</button>
          `).join('')}
          <button class="catalog-tab" data-tab="custom">✏️ Perso</button>
        </div>
        <div class="catalog-body" id="catalog-body">
          ${HABIT_CATEGORIES.map(cat => `
            <div class="catalog-category" data-cat="${cat.id}">
              <div class="catalog-category-header">${cat.icon} ${cat.name}</div>
              <div class="catalog-category-grid">
                ${cat.habits.map(h => {
                  const already = existingNames.has(h.name);
                  return `
                    <div class="catalog-item ${already ? 'catalog-item-added' : ''}" data-habit='${JSON.stringify(h).replace(/'/g, '&#39;')}' data-name="${escapeHtml(h.name).toLowerCase()}">
                      <span class="catalog-item-icon">${h.icon}</span>
                      <span class="catalog-item-name">${escapeHtml(h.name)}</span>
                      ${already ? '<span class="catalog-item-badge">✓</span>' : '<span class="catalog-item-add">+</span>'}
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="catalog-custom-section hidden" id="catalog-custom">
          <div>
            <label class="label">Icône</label>
            <div class="emoji-picker-row" id="emoji-picker">
              ${['⭐','💪','🧘','📖','🏋️','💧','🔥','🎯','💻','🧠','🚀','🌙','🎵','📝','🛡️','💰','🧊','🍎','🚶','⚡','🧹','📵','🤲','🎨'].map(e => `
                <button class="emoji-pick-btn ${e === '⭐' ? 'active' : ''}" data-emoji="${e}">${e}</button>
              `).join('')}
            </div>
          </div>
          <div><label class="label">Nom</label><input class="input" id="new-habit-name" placeholder="Nom de l'habitude"></div>
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
          <button class="btn btn-primary" id="new-save" style="width:100%;margin-top:var(--space-sm)">Créer l'habitude</button>
        </div>
      </div>
    `;
    let habitsAdded = false;
    const modal = showModal({ title: 'Catalogue d\'habitudes', content: formEl, onClose: () => {
      if (habitsAdded) render(container);
    }});

    const catalogBody = $('#catalog-body', formEl);
    const customSection = $('#catalog-custom', formEl);
    const searchInput = $('#catalog-search', formEl);
    const allCategories = formEl.querySelectorAll('.catalog-category');
    const allItems = formEl.querySelectorAll('.catalog-item');

    // Tab switching
    formEl.querySelectorAll('.catalog-tab').forEach(tab => {
      on(tab, 'click', () => {
        formEl.querySelectorAll('.catalog-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabId = tab.dataset.tab;

        if (tabId === 'custom') {
          catalogBody.classList.add('hidden');
          customSection.classList.remove('hidden');
        } else {
          catalogBody.classList.remove('hidden');
          customSection.classList.add('hidden');
          allCategories.forEach(cat => {
            cat.classList.toggle('hidden', tabId !== 'all' && cat.dataset.cat !== tabId);
          });
        }
        searchInput.value = '';
        allItems.forEach(item => item.classList.remove('catalog-item-hidden'));
      });
    });

    // Search
    on(searchInput, 'input', () => {
      const q = searchInput.value.toLowerCase().trim();
      // Show all categories during search
      allCategories.forEach(cat => cat.classList.remove('hidden'));
      customSection.classList.add('hidden');
      catalogBody.classList.remove('hidden');

      allItems.forEach(item => {
        const match = !q || item.dataset.name.includes(q);
        item.classList.toggle('catalog-item-hidden', !match);
      });
      // Hide empty categories
      allCategories.forEach(cat => {
        const visible = cat.querySelectorAll('.catalog-item:not(.catalog-item-hidden)');
        cat.classList.toggle('hidden', visible.length === 0);
      });

      // Reset active tab
      if (q) {
        formEl.querySelectorAll('.catalog-tab').forEach(t => t.classList.remove('active'));
      }
    });

    // Catalog pick — show frequency picker first
    allItems.forEach(el => {
      if (el.classList.contains('catalog-item-added')) return;
      on(el, 'click', () => {
        const h = JSON.parse(el.dataset.habit.replace(/&#39;/g, "'"));

        // Build frequency picker popup
        const freqPopup = document.createElement('div');
        freqPopup.className = 'freq-popup';
        freqPopup.innerHTML = `
          <div class="freq-popup-header">
            <span class="freq-popup-icon">${h.icon}</span>
            <span class="freq-popup-name">${escapeHtml(h.name)}</span>
          </div>
          <p class="freq-popup-label">À quelle fréquence ?</p>
          <div class="freq-popup-options">
            <button class="freq-option" data-freq="daily">
              <span class="freq-option-emoji">📅</span>
              <span class="freq-option-text">Tous les jours</span>
            </button>
            <button class="freq-option" data-freq="weekly_5">
              <span class="freq-option-emoji">💼</span>
              <span class="freq-option-text">Lun - Ven</span>
            </button>
            <button class="freq-option" data-freq="weekly_3">
              <span class="freq-option-emoji">3️⃣</span>
              <span class="freq-option-text">3x / semaine</span>
            </button>
            <button class="freq-option" data-freq="custom:0,3">
              <span class="freq-option-emoji">2️⃣</span>
              <span class="freq-option-text">2x / semaine</span>
            </button>
            <button class="freq-option" data-freq="custom:5,6">
              <span class="freq-option-emoji">🏖️</span>
              <span class="freq-option-text">Weekend</span>
            </button>
          </div>
          <p class="freq-popup-label" style="margin-top:var(--space-sm)">Ou choisis tes jours :</p>
          <div class="freq-custom-days">
            <button class="freq-day-btn" data-day="0">Lun</button>
            <button class="freq-day-btn" data-day="1">Mar</button>
            <button class="freq-day-btn" data-day="2">Mer</button>
            <button class="freq-day-btn" data-day="3">Jeu</button>
            <button class="freq-day-btn" data-day="4">Ven</button>
            <button class="freq-day-btn" data-day="5">Sam</button>
            <button class="freq-day-btn" data-day="6">Dim</button>
          </div>
          <button class="btn btn-primary btn-sm freq-custom-confirm hidden" id="freq-custom-go" style="width:100%;margin-top:var(--space-sm)">Valider</button>
        `;

        const freqModal = showModal({ title: '', content: freqPopup });

        async function addWithFreq(freq) {
          freqModal.close();
          el.classList.add('catalog-item-adding');
          await createHabit({ member_id: memberId, name: h.name, icon: h.icon, color: h.color, frequency: freq });
          el.classList.remove('catalog-item-adding');
          el.classList.add('catalog-item-added');
          el.querySelector('.catalog-item-add').textContent = '✓';
          el.querySelector('.catalog-item-add').className = 'catalog-item-badge';
          existingNames.add(h.name);
          habitsAdded = true;
          showToast(`${h.icon} ${h.name} ajoutée`);
        }

        freqPopup.querySelectorAll('.freq-option').forEach(btn => {
          on(btn, 'click', () => addWithFreq(btn.dataset.freq));
        });

        // Custom day picker
        const confirmBtn = freqPopup.querySelector('#freq-custom-go');
        freqPopup.querySelectorAll('.freq-day-btn').forEach(btn => {
          on(btn, 'click', (e) => {
            e.preventDefault();
            btn.classList.toggle('active');
            const anyActive = freqPopup.querySelector('.freq-day-btn.active');
            confirmBtn.classList.toggle('hidden', !anyActive);
          });
        });
        on(confirmBtn, 'click', () => {
          const days = [...freqPopup.querySelectorAll('.freq-day-btn.active')]
            .map(b => b.dataset.day).join(',');
          if (days) addWithFreq(`custom:${days}`);
        });
      });
    });

    // Custom habit
    const freqSelect = $('#new-habit-freq', formEl);
    const daysPicker = $('#new-days-picker', formEl);
    on(freqSelect, 'change', () => {
      daysPicker.classList.toggle('hidden', freqSelect.value !== 'custom');
    });
    daysPicker.querySelectorAll('.day-pick-btn').forEach(btn => {
      on(btn, 'click', (e) => {
        e.preventDefault();
        btn.classList.toggle('active');
      });
    });

    // Emoji picker
    formEl.querySelectorAll('.emoji-pick-btn').forEach(btn => {
      on(btn, 'click', (e) => {
        e.preventDefault();
        formEl.querySelectorAll('.emoji-pick-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    on($('#new-save', formEl), 'click', async () => {
      const name = $('#new-habit-name', formEl).value.trim();
      if (!name) return;
      const selectedEmoji = formEl.querySelector('.emoji-pick-btn.active')?.dataset.emoji || '⭐';
      let frequency = freqSelect.value;
      if (frequency === 'custom') {
        const selectedDays = [...daysPicker.querySelectorAll('.day-pick-btn.active')]
          .map(b => b.dataset.day).join(',');
        frequency = selectedDays ? `custom:${selectedDays}` : 'daily';
      }
      await createHabit({ member_id: memberId, name, icon: selectedEmoji, color: HABIT_COLORS[0], frequency });
      modal.close();
      render(container);
      showToast(`${selectedEmoji} ${name} créée`);
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
        item.style.transition = 'all 0.3s ease';
        item.style.opacity = '0';
        item.style.transform = 'translateX(-100%)';
        item.style.maxHeight = item.offsetHeight + 'px';
        setTimeout(() => {
          item.style.maxHeight = '0';
          item.style.padding = '0';
          item.style.margin = '0';
          item.style.overflow = 'hidden';
        }, 200);
        setTimeout(() => item.remove(), 500);
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
          <div><label class="label">Nom</label><input class="input" id="edit-h-name" value="${escapeHtml(habit.name)}"></div>
          <div><label class="label">Icône</label><input class="input" id="edit-h-icon" value="${escapeHtml(habit.icon)}" maxlength="4" style="width:80px"></div>
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

}
