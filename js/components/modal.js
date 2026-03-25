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

  // Lock body scroll when modal is open
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.width = '100%';
  document.body.style.top = `-${window.scrollY}px`;
  const savedScrollY = window.scrollY;

  function close() {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.2s';
    // Restore body scroll
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.top = '';
    window.scrollTo(0, savedScrollY);
    setTimeout(() => {
      overlay.remove();
      if (onClose) onClose();
    }, 200);
  }

  // Close on overlay tap (not on content)
  on(overlay, 'click', (e) => {
    if (e.target === overlay) close();
  });

  // Prevent overlay touch from propagating but allow modal-content scroll
  overlay.addEventListener('touchmove', (e) => {
    const modalContent = overlay.querySelector('.modal-content');
    if (!modalContent.contains(e.target)) {
      e.preventDefault();
    }
  }, { passive: false });

  document.body.appendChild(overlay);
  return { close, overlay };
}
