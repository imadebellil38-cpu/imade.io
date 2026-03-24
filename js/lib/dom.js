export function $(sel, root = document) {
  return root.querySelector(sel);
}

export function $$(sel, root = document) {
  return Array.from(root.querySelectorAll(sel));
}

export function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(element.style, value);
    } else if (key.startsWith('on')) {
      element.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  }
  for (const child of children) {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child) {
      element.appendChild(child);
    }
  }
  return element;
}

export function html(container, htmlStr) {
  container.innerHTML = htmlStr;
  return container;
}

export function on(element, event, handler, opts) {
  element.addEventListener(event, handler, opts);
  return () => element.removeEventListener(event, handler, opts);
}

export function delegate(parent, sel, event, handler) {
  return on(parent, event, (e) => {
    const target = e.target.closest(sel);
    if (target && parent.contains(target)) {
      handler(e, target);
    }
  });
}
