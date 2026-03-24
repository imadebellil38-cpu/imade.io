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

  clear() {
    localStorage.removeItem(PREFIX + 'member_id');
    localStorage.removeItem(PREFIX + 'pseudo');
    localStorage.removeItem(PREFIX + 'avatar');
  }
};
