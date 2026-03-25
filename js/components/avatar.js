import { Store } from '../lib/store.js';

export function renderAvatar(emoji, size = 'md', extraClass = '', memberId = null, memberData = null) {
  // Check Supabase avatar_url from member data first
  if (memberData && memberData.avatar_url) {
    return `<div class="avatar avatar-${size} ${extraClass} avatar-photo" style="background-image:url(${memberData.avatar_url})"></div>`;
  }
  // Fall back to localStorage photo
  const photo = Store.getProfilePhoto(memberId);
  if (photo) {
    return `<div class="avatar avatar-${size} ${extraClass} avatar-photo" style="background-image:url(${photo})"></div>`;
  }
  return `<div class="avatar avatar-${size} ${extraClass}">${emoji || '&#x1f600;'}</div>`;
}
