const PREFIX = 'empire_';

export const Store = {
  getMemberId() {
    return localStorage.getItem(PREFIX + 'member_id');
  },

  setMemberId(id) {
    localStorage.setItem(PREFIX + 'member_id', id);
  },

  getPseudo() {
    return localStorage.getItem(PREFIX + 'pseudo');
  },

  setPseudo(pseudo) {
    localStorage.setItem(PREFIX + 'pseudo', pseudo);
  },

  getAvatar() {
    return localStorage.getItem(PREFIX + 'avatar') || '😀';
  },

  setAvatar(emoji) {
    localStorage.setItem(PREFIX + 'avatar', emoji);
  },

  getTheme() {
    return localStorage.getItem(PREFIX + 'theme') || 'dark';
  },

  setTheme(theme) {
    localStorage.setItem(PREFIX + 'theme', theme);
  },

  getProfilePhoto(memberId) {
    const id = memberId || this.getMemberId();
    return localStorage.getItem(PREFIX + 'photo_' + id) || null;
  },

  setProfilePhoto(base64, memberId) {
    const id = memberId || this.getMemberId();
    if (base64) {
      localStorage.setItem(PREFIX + 'photo_' + id, base64);
    } else {
      localStorage.removeItem(PREFIX + 'photo_' + id);
    }
  },

  clear() {
    localStorage.removeItem(PREFIX + 'member_id');
    localStorage.removeItem(PREFIX + 'pseudo');
    localStorage.removeItem(PREFIX + 'avatar');
    localStorage.removeItem(PREFIX + 'profile_photo');
    localStorage.removeItem(PREFIX + 'theme');
  }
};
