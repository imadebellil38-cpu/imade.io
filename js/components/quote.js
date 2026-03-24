import { QUOTES } from '../data/quotes.js';

export function renderQuote(container) {
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  container.innerHTML = `
    <div class="daily-quote">
      <p class="daily-quote-text">"${quote.text}"</p>
      <p class="daily-quote-author">— ${quote.author}</p>
    </div>
  `;
}
