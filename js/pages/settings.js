import { html, $, on } from '../lib/dom.js';
import { Store } from '../lib/store.js';
import { showNavbar } from '../components/navbar.js';
import { renderAvatar } from '../components/avatar.js';
import { showToast } from '../components/toast.js';
import { getMember, updateMember } from '../services/members.js';
import { navigate } from '../router.js';

export function destroy() {}

export async function render(container) {
  showNavbar();
  const memberId = Store.getMemberId();
  if (!memberId) { navigate('#onboarding'); return; }

  const member = await getMember(memberId);
  if (!member) { navigate('#onboarding'); return; }

  const currentTheme = Store.getTheme();
  const isDark = currentTheme === 'dark';
  const currentPhoto = Store.getProfilePhoto();

  html(container, `
    <div class="page" style="padding-bottom:120px">
      <div style="display:flex;align-items:center;gap:var(--space-sm);padding:var(--space-md)">
        <button class="grit-icon-btn" id="settings-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 style="font-family:var(--font-display);font-size:1.2rem;font-weight:700">Paramètres</h1>
      </div>

      <!-- Theme Toggle -->
      <div class="settings-section">
        <h3 class="settings-section-title">Apparence</h3>
        <div class="settings-row" id="theme-toggle-row">
          <span class="settings-row-label">${isDark ? '🌙 Mode sombre' : '☀️ Mode clair'}</span>
          <div class="settings-toggle ${isDark ? '' : 'active'}">
            <div class="settings-toggle-knob"></div>
          </div>
        </div>
      </div>

      <!-- Profile Section -->
      <div class="settings-section">
        <h3 class="settings-section-title">Profil</h3>
        <div style="display:flex;flex-direction:column;gap:var(--space-md)">
          <div>
            <label class="label" style="margin-bottom:6px;display:block">Pseudo</label>
            <input class="input" id="settings-pseudo" value="${member.pseudo}" placeholder="Ton pseudo">
          </div>
          <div>
            <label class="label" style="margin-bottom:6px;display:block">Bio</label>
            <input class="input" id="settings-bio" value="${member.bio || ''}" placeholder="Une petite bio...">
          </div>
          <button class="btn btn-primary btn-sm" id="settings-save-profile" style="align-self:flex-start">Sauvegarder</button>
        </div>
      </div>

      <!-- Photo Section -->
      <div class="settings-section">
        <h3 class="settings-section-title">Photo de profil</h3>
        <div style="display:flex;align-items:center;gap:var(--space-md)">
          <div id="settings-photo-preview" style="width:64px;height:64px;border-radius:50%;background:var(--bg-elevated);display:flex;align-items:center;justify-content:center;font-size:2rem;overflow:hidden;border:2px solid var(--accent-primary);flex-shrink:0;${currentPhoto ? 'background-image:url(' + currentPhoto + ');background-size:cover;background-position:center;font-size:0' : ''}">
            ${currentPhoto ? '' : (member.avatar_emoji || '😀')}
          </div>
          <div style="display:flex;flex-direction:column;gap:var(--space-xs)">
            <button class="btn btn-secondary btn-sm" id="settings-photo-upload">📷 Changer la photo</button>
            ${currentPhoto ? '<button class="btn btn-ghost btn-sm" id="settings-photo-remove" style="color:var(--accent-red)">Supprimer la photo</button>' : ''}
          </div>
          <input type="file" id="settings-photo-input" accept="image/*" style="display:none">
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="settings-section settings-danger-zone">
        <h3 class="settings-section-title" style="color:var(--accent-red)">Zone dangereuse</h3>
        <div style="display:flex;flex-direction:column;gap:var(--space-sm)">
          <button class="btn btn-secondary btn-sm" id="settings-logout" style="border-color:var(--accent-red);color:var(--accent-red)">🚪 Se déconnecter</button>
          <button class="btn btn-danger btn-sm" id="settings-delete-account">🗑️ Supprimer mon compte</button>
        </div>
      </div>

      <!-- About -->
      <div class="settings-section" style="text-align:center;padding-top:var(--space-lg)">
        <p style="font-family:var(--font-display);font-weight:700;font-size:0.9rem;color:var(--text-primary)">EmpireTrack v1.0</p>
        <p style="font-size:0.8rem;color:var(--text-muted);margin-top:4px">Fait pour l'Empire</p>
      </div>
    </div>
  `);

  // Back button
  on($('#settings-back', container), 'click', () => history.back());

  // Theme toggle
  on($('#theme-toggle-row', container), 'click', () => {
    const current = Store.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    Store.setTheme(next);
    document.documentElement.dataset.theme = next;
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = next === 'light' ? '#f5f5f0' : '#050510';
    }
    render(container);
  });

  // Save profile
  on($('#settings-save-profile', container), 'click', async () => {
    const newPseudo = $('#settings-pseudo', container).value.trim();
    const newBio = $('#settings-bio', container).value.trim();
    if (!newPseudo) { showToast('Le pseudo est requis', 'error'); return; }
    try {
      await updateMember(memberId, { pseudo: newPseudo, bio: newBio || null });
      Store.setPseudo(newPseudo);
      showToast('Profil mis à jour');
    } catch (err) {
      showToast('Erreur lors de la sauvegarde', 'error');
    }
  });

  // Photo upload
  on($('#settings-photo-upload', container), 'click', () => {
    $('#settings-photo-input', container)?.click();
  });

  on($('#settings-photo-input', container), 'change', (e) => {
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
        updateMember(memberId, { avatar_url: base64 });
        showToast('Photo mise à jour');
        render(container);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  // Remove photo
  const removeBtn = $('#settings-photo-remove', container);
  if (removeBtn) {
    on(removeBtn, 'click', () => {
      Store.setProfilePhoto(null);
      updateMember(memberId, { avatar_url: null });
      showToast('Photo supprimée');
      render(container);
    });
  }

  // Logout
  on($('#settings-logout', container), 'click', () => {
    if (confirm('Te déconnecter ? Tes données locales seront perdues.')) {
      Store.clear();
      location.hash = '#onboarding';
      location.reload();
    }
  });

  // Delete account
  on($('#settings-delete-account', container), 'click', async () => {
    if (confirm('Supprimer ton compte ? Cette action est irréversible.')) {
      if (confirm('Es-tu vraiment sûr ? Toutes tes données seront perdues.')) {
        try {
          const { getClient } = await import('../lib/supabase.js');
          const db = getClient();
          // Delete member (cascades to habits and checkins)
          await db.from('members').delete().eq('id', memberId);
          Store.clear();
          showToast('Compte supprimé');
          location.hash = '#onboarding';
          location.reload();
        } catch (err) {
          showToast('Erreur lors de la suppression', 'error');
        }
      }
    }
  });
}
