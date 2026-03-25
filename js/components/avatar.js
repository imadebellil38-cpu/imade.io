import { Store } from '../lib/store.js';

export function renderAvatar(emoji, size = 'md', extraClass = '') {
  const photo = Store.getProfilePhoto();
  if (photo) {
    return `<div class="avatar avatar-${size} ${extraClass} avatar-photo" style="background-image:url(${photo})"></div>`;
  }
  return `<div class="avatar avatar-${size} ${extraClass}">${emoji || '😀'}</div>`;
}
