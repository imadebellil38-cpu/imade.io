export function initParticles(canvas, { count = 80, colors = ['#00FF88', '#4488FF', '#AA44FF', '#FFD700', '#FF4466'], duration = 2500 } = {}) {
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 100,
      vx: (Math.random() - 0.5) * 3,
      vy: -(Math.random() * 4 + 2),
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
      decay: Math.random() * 0.01 + 0.005,
    });
  }

  const start = Date.now();
  let animId;

  function frame() {
    const elapsed = Date.now() - start;
    if (elapsed > duration) {
      cancelAnimationFrame(animId);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.02; // slight gravity
      p.opacity -= p.decay;
      if (p.opacity <= 0) continue;

      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    animId = requestAnimationFrame(frame);
  }

  animId = requestAnimationFrame(frame);

  return () => cancelAnimationFrame(animId);
}
