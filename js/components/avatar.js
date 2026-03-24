export function renderAvatar(emoji, size = 'md', extraClass = '') {
  return `<div class="avatar avatar-${size} ${extraClass}">${emoji || '😀'}</div>`;
}
