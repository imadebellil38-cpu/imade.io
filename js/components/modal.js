import { on } from '../lib/dom.js';

export function showModal({ title, content, onClose }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        ${title ? `<h3 class="modal-title">${title}</h3>` : '<div></div>'}
        <button class="modal-close-btn" id="modal-close-x">✕</button>
      </div>
      <div class="modal-body"></div>
    </div>
  `;

  const body = overlay.querySelector('.modal-body');
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else {
    body.appendChild(content);
  }

  const app = document.getElementById('app');
  if (app) app.style.overflow = 'hidden';

  let closed = false;
  function close() {
    if (closed) return;
    closed = true;
    if (app) app.style.overflow = '';
    document.removeEventListener('keydown', escHandler);
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.2s';
    setTimeout(() => {
      overlay.remove();
      if (onClose) onClose();
    }, 200);
  }

  // ESC key
  function escHandler(e) {
    if (e.key === 'Escape') close();
  }
  document.addEventListener('keydown', escHandler);

  // Close button
  on(overlay.querySelector('#modal-close-x'), 'click', close);

  // Close on overlay background tap
  on(overlay, 'click', (e) => {
    if (e.target === overlay) close();
  });

  document.body.appendChild(overlay);
  return { close, overlay };
}
