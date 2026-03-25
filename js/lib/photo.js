import { Store } from './store.js';
import { showToast } from '../components/toast.js';

const MAX_SIZE = 200;
const QUALITY = 0.7;

/**
 * Resize an image file to a square, save it as profile photo, and persist via updateMemberFn.
 * @param {File} file - The image file from an <input type="file">
 * @param {string} memberId - The member's ID
 * @param {function} updateMemberFn - async (id, data) => void  (e.g. updateMember)
 * @param {object} [opts]
 * @param {number} [opts.maxFileSize=2000000] - Max allowed raw file size in bytes
 * @param {function} [opts.onDone] - Called with the base64 string after save
 * @returns {void}
 */
export function processAndSavePhoto(file, memberId, updateMemberFn, opts = {}) {
  const maxFileSize = opts.maxFileSize || 10000000;
  if (file.size > maxFileSize) {
    const label = maxFileSize >= 1000000
      ? `${Math.round(maxFileSize / 1000000)}MB`
      : `${Math.round(maxFileSize / 1000)}KB`;
    showToast(`Photo trop lourde (max ${label})`, 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = MAX_SIZE;
      canvas.height = MAX_SIZE;
      const ctx = canvas.getContext('2d');
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, MAX_SIZE, MAX_SIZE);
      const base64 = canvas.toDataURL('image/jpeg', QUALITY);
      Store.setProfilePhoto(base64);
      updateMemberFn(memberId, { avatar_url: base64 });
      showToast('Photo mise à jour');
      if (opts.onDone) opts.onDone(base64);
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

/**
 * Remove the profile photo for a member.
 * @param {string} memberId
 * @param {function} updateMemberFn - async (id, data) => void
 * @param {object} [opts]
 * @param {function} [opts.onDone] - Called after removal
 */
export function removePhoto(memberId, updateMemberFn, opts = {}) {
  Store.setProfilePhoto(null);
  updateMemberFn(memberId, { avatar_url: null });
  showToast('Photo supprimée');
  if (opts.onDone) opts.onDone();
}
