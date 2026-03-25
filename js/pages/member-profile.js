import { html, $, on } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { showNavbar } from '../components/navbar.js';
import { showToast } from '../components/toast.js';
import { renderAvatar } from '../components/avatar.js';
import { getMember } from '../services/members.js';
import { getHabitsForMember, createHabit } from '../services/habits.js';
import { getCheckinsForRange } from '../services/checkins.js';
import { computeStreaks, computePoints, getRankTier } from '../services/scoring.js';
import { today, daysAgo, daysBetween, dateRange, isDueOnDate } from '../lib/dates.js';

export function destroy() {}

export async function render(container, params) {
  showNavbar();
  const memberId = params?.id;
  if (!memberId) { location.hash = '#leaderboard'; return; }

  html(container, `<div class="page"><div class="text-center mt-md"><div class="loader" style="margin:0 auto"></div></div></div>`);

  const member = await getMember(memberId);
  if (!member) {
    html(container, `<div class="page"><div class="text-center mt-lg"><p>Membre introuvable</p><button class="btn btn-ghost" id="back-btn">← Retour</button></div></div>`);
    on($('#back-btn', container), 'click', () => history.back());
    return;
  }

  const [habits, streaks, points] = await Promise.all([
    getHabitsForMember(memberId),
    computeStreaks(memberId).catch(() => ({})),
    computePoints(memberId).catch(() => ({ total: 0, perfectDays: 0, totalCheckins: 0 })),
  ]);

  const rank = getRankTier(points.total);
  const myId = Store.getMemberId();
  const isOther = myId !== memberId;
  let maxStreak = 0;
  for (const s of Object.values(streaks)) {
    if (s.currentStreak > maxStreak) maxStreak = s.currentStreak;
  }

  // Last 30 days checkins
  const monthCheckins = await getCheckinsForRange(memberId, daysAgo(29), today());
  const checkinSet = new Set(monthCheckins.map(c => `${c.habit_id}_${c.date}`));
  const todayStr = today();

  // Build 30-day daily percentages for chart
  const monthDays = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-CA');
    const dueH = habits.filter(h => isDueOnDate(h.frequency, dateStr));
    const doneH = dueH.filter(h => checkinSet.has(`${h.id}_${dateStr}`));
    const pct = dueH.length > 0 ? Math.round((doneH.length / dueH.length) * 100) : 0;
    monthDays.push({ dateStr, dayNum: d.getDate(), pct });
  }

  html(container, `
    <div class="page">
      <div style="display:flex;align-items:center;gap:var(--space-sm);margin-bottom:var(--space-lg)">
        <button class="grit-icon-btn" id="mp-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <span style="font-family:var(--font-display);font-weight:700;font-size:1.1rem">Profil</span>
      </div>

      <div class="text-center" style="margin-bottom:var(--space-lg)">
        ${renderAvatar(member.avatar_emoji, 'xl', '', memberId, member)}
        <h2 style="margin-top:var(--space-sm);font-size:1.4rem">${member.pseudo}</h2>
        <span style="color:var(--accent-primary);font-weight:600;font-size:0.9rem">${rank.emoji} ${rank.name}</span>
        ${member.bio ? `<p style="color:var(--text-secondary);font-size:0.85rem;margin-top:var(--space-xs)">${member.bio}</p>` : ''}
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-bottom:var(--space-lg)">
        <div class="mp-stat">
          <span class="mp-stat-val">${points.total}</span>
          <span class="mp-stat-lbl">Points</span>
        </div>
        <div class="mp-stat">
          <span class="mp-stat-val">${maxStreak}🔥</span>
          <span class="mp-stat-lbl">Streak</span>
        </div>
        <div class="mp-stat">
          <span class="mp-stat-val">${points.perfectDays || 0}</span>
          <span class="mp-stat-lbl">Jours parfaits</span>
        </div>
      </div>

      <div style="margin-bottom:var(--space-lg)">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-sm)">
          <h3 style="font-size:0.9rem;font-weight:700;color:var(--text-secondary)">
            ${habits.length} habitude${habits.length > 1 ? 's' : ''} actives
          </h3>
          ${isOther ? `<button class="btn btn-ghost btn-sm" id="copy-all-habits" style="color:var(--accent-primary);font-size:0.78rem">📋 Copier toutes</button>` : ''}
        </div>
        <div style="display:flex;flex-direction:column;gap:6px" id="member-habits-list">
          ${habits.map(h => {
            const streak = streaks[h.id]?.currentStreak || 0;
            const checkedToday = checkinSet.has(`${h.id}_${todayStr}`);
            return `
              <div style="display:flex;align-items:center;gap:var(--space-sm);padding:10px var(--space-md);background:var(--bg-card);border-radius:var(--radius-md);border:1px solid ${checkedToday ? 'rgba(0,255,136,0.15)' : 'transparent'}" data-habit-name="${h.name}" data-habit-icon="${h.icon}" data-habit-color="${h.color}" data-habit-freq="${h.frequency}">
                <span style="font-size:1.2rem">${h.icon}</span>
                <span style="flex:1;font-size:0.9rem;font-weight:600">${h.name}</span>
                ${streak > 0 ? `<span style="font-size:0.75rem;color:var(--text-muted)">🔥${streak}</span>` : ''}
                ${checkedToday ? '<span style="color:var(--accent-green);font-size:0.85rem">✓</span>' : ''}
                ${isOther ? `<button class="copy-habit-btn" style="background:none;border:none;color:var(--accent-primary);cursor:pointer;padding:4px;font-size:0.85rem" title="Ajouter cette habitude">+</button>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-sm)">
          <h3 style="font-size:0.9rem;font-weight:700;color:var(--text-secondary)">Progression 30 jours</h3>
          <span style="font-size:0.75rem;color:var(--text-muted)">Moy. ${Math.round(monthDays.reduce((a, d) => a + d.pct, 0) / monthDays.length)}%</span>
        </div>
        <div style="background:var(--bg-card);border-radius:var(--radius-md);padding:var(--space-sm);border:1px solid rgba(0,255,136,0.06)">
          ${(() => {
            const W = 340, H = 120, padL = 25, padR = 8, padT = 8, padB = 22;
            const chartW = W - padL - padR, chartH = H - padT - padB;
            const pts = monthDays.map((d, i) => ({
              x: padL + (i / (monthDays.length - 1)) * chartW,
              y: padT + chartH - (d.pct / 100) * chartH
            }));
            // Smooth bezier
            let path = `M ${pts[0].x},${pts[0].y}`;
            for (let i = 0; i < pts.length - 1; i++) {
              const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
              const t = 0.3;
              path += ` C ${p1.x + (p2.x - p0.x) * t},${p1.y + (p2.y - p0.y) * t} ${p2.x - (p3.x - p1.x) * t},${p2.y - (p3.y - p1.y) * t} ${p2.x},${p2.y}`;
            }
            const area = `${path} L ${pts[pts.length-1].x},${H - padB} L ${pts[0].x},${H - padB} Z`;
            const labels = monthDays.filter((_, i) => i % 5 === 0 || i === monthDays.length - 1).map((d, _, arr) => {
              const idx = monthDays.indexOf(d);
              const x = padL + (idx / (monthDays.length - 1)) * chartW;
              return `<text x="${x}" y="${H - 4}" text-anchor="middle" fill="var(--text-muted)" font-size="8" font-weight="600">${d.dayNum}</text>`;
            }).join('');
            const yLabels = [0, 50, 100].map(v => {
              const y = padT + chartH - (v / 100) * chartH;
              return `<text x="${padL - 4}" y="${y + 3}" text-anchor="end" fill="var(--text-muted)" font-size="7" font-weight="600">${v}%</text>`;
            }).join('');
            const dots = pts.map((pt, i) => {
              const c = monthDays[i].pct === 100 ? 'var(--accent-green)' : 'var(--accent-primary)';
              return `<circle cx="${pt.x}" cy="${pt.y}" r="2.5" fill="${c}" stroke="var(--bg-card)" stroke-width="1"/>`;
            }).join('');
            return `
              <svg viewBox="0 0 ${W} ${H}" style="width:100%;display:block">
                <defs><linearGradient id="mpGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="var(--accent-primary)" stop-opacity="0.2"/><stop offset="100%" stop-color="var(--accent-primary)" stop-opacity="0"/></linearGradient></defs>
                ${yLabels}
                <line x1="${padL}" y1="${padT + chartH}" x2="${W - padR}" y2="${padT + chartH}" stroke="var(--text-muted)" stroke-width="0.3" opacity="0.3"/>
                <line x1="${padL}" y1="${padT + chartH/2}" x2="${W - padR}" y2="${padT + chartH/2}" stroke="var(--text-muted)" stroke-width="0.3" stroke-dasharray="3,3" opacity="0.2"/>
                <path d="${area}" fill="url(#mpGrad)"/>
                <path d="${path}" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                ${dots}
                ${labels}
              </svg>
            `;
          })()}
        </div>
      </div>
    </div>
  `);

  on($('#mp-back', container), 'click', () => history.back());

  // Copy single habit
  if (isOther) {
    container.querySelectorAll('.copy-habit-btn').forEach(btn => {
      on(btn, 'click', async (e) => {
        e.stopPropagation();
        const row = btn.closest('[data-habit-name]');
        const name = row.dataset.habitName;
        const icon = row.dataset.habitIcon;
        const color = row.dataset.habitColor;
        const freq = row.dataset.habitFreq;
        try {
          await createHabit({ member_id: myId, name, icon, color, frequency: freq });
          btn.textContent = '✓';
          btn.style.color = 'var(--accent-green)';
          btn.disabled = true;
          showToast(`${icon} ${name} ajoutée !`);
        } catch {
          showToast('Erreur', 'error');
        }
      });
    });

    // Copy all habits
    const copyAllBtn = $('#copy-all-habits', container);
    if (copyAllBtn) {
      on(copyAllBtn, 'click', async () => {
        copyAllBtn.disabled = true;
        copyAllBtn.textContent = '⏳ Copie...';
        let count = 0;
        for (const h of habits) {
          try {
            await createHabit({ member_id: myId, name: h.name, icon: h.icon, color: h.color, frequency: h.frequency });
            count++;
          } catch { /* skip duplicates */ }
        }
        copyAllBtn.textContent = `✓ ${count} copiées`;
        copyAllBtn.style.color = 'var(--accent-green)';
        showToast(`${count} habitudes copiées de ${member.pseudo} !`);
      });
    }
  }
}
