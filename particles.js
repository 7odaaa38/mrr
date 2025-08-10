
// Mr Presentation - Particles Background (vanilla JS)
// إعداد: نقاط تتحرك وتترابط بخطوط عند تقاربها. متجاوبة وخفيفة على المعالِج.
(() => {
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, particles = [], raf, lastT = 0;

  function resize() {
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    // أعِد توليد عدد الجزيئات بناء على المساحة
    const target = Math.min(180, Math.max(60, Math.floor((w*h)/25000)));
    if (particles.length === 0) {
      particles = Array.from({length: target}, () => spawn());
    } else if (particles.length < target) {
      particles.push(...Array.from({length: target - particles.length}, () => spawn()));
    } else if (particles.length > target) {
      particles.length = target;
    }
  }

  function spawn() {
    // السرعة والاتجاه عشوائيين، مع انحياز بسيط لليمين-الأسفل
    const speed = 0.15 + Math.random()*0.35;
    const angle = Math.random()*Math.PI*2;
    return {
      x: Math.random()*w,
      y: Math.random()*h,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed,
      r: 1 + Math.random()*1.5,
      hue: 260 + Math.random()*120 // بين بنفسجي->سيان
    };
  }

  function step(ts) {
    const dt = Math.min(40, ts - lastT || 16);
    lastT = ts;
    ctx.clearRect(0,0,w,h);

    // خلفية شفافة خفيفة (توهج)
    // تُرسم في CSS، هنا نكتفي بالنقاط والخطوط
    const linkDist = Math.min(160, Math.max(90, Math.sqrt(w*h)/30));
    const pts = particles;

    // تحديث ورسم النقاط
    for (let p of pts) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      // ارتداد من الحواف
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      // نقطة
      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, .9)`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }

    // خطوط وصل
    ctx.lineWidth = 1;
    for (let i=0;i<pts.length;i++){
      for (let j=i+1;j<pts.length;j++){
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d2 = dx*dx + dy*dy;
        if (d2 < linkDist*linkDist){
          const a = 1 - (Math.sqrt(d2)/linkDist);
          // تدرّج بنفسجي->سيان على حسب موقع الخط
          const g = ctx.createLinearGradient(pts[i].x, pts[i].y, pts[j].x, pts[j].y);
          g.addColorStop(0, 'rgba(124,58,237,'+ (0.35*a) +')');
          g.addColorStop(1, 'rgba(34,211,238,'+ (0.35*a) +')');
          ctx.strokeStyle = g;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }

    raf = requestAnimationFrame(step);
  }

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();
  raf = requestAnimationFrame(step);

  // تنظيف عند إخفاء الصفحة
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf);
    else raf = requestAnimationFrame(step);
  });
})();
