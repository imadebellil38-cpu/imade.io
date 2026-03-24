export function renderChart(canvas, dailyData) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const w = rect.width;
  const h = rect.height;
  const padding = { top: 10, right: 10, bottom: 30, left: 35 };
  const chartW = w - padding.left - padding.right;
  const chartH = h - padding.top - padding.bottom;

  // Clear
  ctx.clearRect(0, 0, w, h);

  if (!dailyData.length) return;

  // Grid lines
  ctx.strokeStyle = 'rgba(85, 85, 119, 0.3)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(w - padding.right, y);
    ctx.stroke();
  }

  // Y-axis labels
  ctx.fillStyle = '#8888AA';
  ctx.font = '10px -apple-system, sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartH / 4) * i;
    ctx.fillText(`${100 - i * 25}%`, padding.left - 5, y + 3);
  }

  // X-axis labels
  ctx.textAlign = 'center';
  const step = Math.max(1, Math.floor(dailyData.length / 6));
  for (let i = 0; i < dailyData.length; i += step) {
    const x = padding.left + (i / (dailyData.length - 1)) * chartW;
    const label = dailyData[i].date.slice(5); // MM-DD
    ctx.fillText(label, x, h - 5);
  }

  // Data points
  const points = dailyData.map((d, i) => ({
    x: padding.left + (i / (dailyData.length - 1)) * chartW,
    y: padding.top + chartH - (d.percentage / 100) * chartH,
  }));

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
  gradient.addColorStop(0, 'rgba(0, 255, 136, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 255, 136, 0.0)');

  ctx.beginPath();
  ctx.moveTo(points[0].x, padding.top + chartH);
  for (let i = 0; i < points.length; i++) {
    if (i === 0) {
      ctx.lineTo(points[i].x, points[i].y);
    } else {
      const cx = (points[i - 1].x + points[i].x) / 2;
      ctx.bezierCurveTo(cx, points[i - 1].y, cx, points[i].y, points[i].x, points[i].y);
    }
  }
  ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // Line
  ctx.beginPath();
  for (let i = 0; i < points.length; i++) {
    if (i === 0) {
      ctx.moveTo(points[i].x, points[i].y);
    } else {
      const cx = (points[i - 1].x + points[i].x) / 2;
      ctx.bezierCurveTo(cx, points[i - 1].y, cx, points[i].y, points[i].x, points[i].y);
    }
  }
  ctx.strokeStyle = '#00FF88';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dots
  for (const p of points) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#00FF88';
    ctx.fill();
  }
}
