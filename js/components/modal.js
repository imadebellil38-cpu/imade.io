import { on } from '../lib/dom.js';

export function showModal({ title, content, onClose }) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-content">
      ${title ? `<h3 class="modal-title">${title}</h3>` : ''}
      <div class="modal-body"></div>
    </div>
  `;

  const body = overlay.querySelector('.modal-body');
  if (typeof content === 'string') {
    body.innerHTML = content;
  } else {
    body.appendChild(content);
  }

  // Lock #app scroll
  const app = document.getElementById('app');
  if (app) app.style.overflow = 'hidden';

  function close() {
    // Restore #app scroll
    if (app) app.style.overflow = '';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.2s';
    setTimeout(() => {
      overlay.remove();
      if (onClose) onClose();
    }, 200);
  }

  // Close on overlay background tap only
  on(overlay, 'click', (e) => {
    if (e.target === overlay) close();
  });

  document.body.appendChild(overlay);
  return { close, overlay };
}
