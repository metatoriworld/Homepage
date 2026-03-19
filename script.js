// STARFIELD
  const container = document.getElementById('stars');
  for (let i = 0; i < 180; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.2 + 0.4;
    const opacity = Math.random() * 0.55 + 0.1;
    const dur = (Math.random() * 4 + 2).toFixed(1);
    s.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--o:${opacity};--d:${dur}s;animation-delay:${(Math.random()*5).toFixed(1)}s;`;
    container.appendChild(s);
  }

  // SLIDER
  (function() {
    const track = document.getElementById('sliderTrack');
    const slides = track.querySelectorAll('.slide');
    const dotsWrap = document.getElementById('sliderDots');
    const counter = document.getElementById('sliderCounter');
    const total = slides.length;
    let current = 0, startX = 0, isDragging = false, dragDelta = 0;

    slides.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      d.onclick = () => goTo(i);
      dotsWrap.appendChild(d);
    });

    function getOffset(idx) {
      const slideWidth = slides[0].offsetWidth + 16;
      const viewW = track.parentElement.offsetWidth;
      let offset = idx * slideWidth - (viewW - slides[0].offsetWidth) / 2;
      return Math.max(0, Math.min(offset, (total - 1) * slideWidth));
    }

    function goTo(idx) {
      slides[current].classList.remove('active');
      dotsWrap.children[current].classList.remove('active');
      current = (idx + total) % total;
      slides[current].classList.add('active');
      dotsWrap.children[current].classList.add('active');
      counter.textContent = String(current+1).padStart(2,'0') + ' / ' + String(total).padStart(2,'0');
      track.style.transform = `translateX(-${getOffset(current)}px)`;
    }

    document.getElementById('prevBtn').onclick = () => goTo(current - 1);
    document.getElementById('nextBtn').onclick = () => goTo(current + 1);

    track.addEventListener('mousedown', e => { isDragging=true; startX=e.clientX; track.style.transition='none'; });
    window.addEventListener('mousemove', e => {
      if (!isDragging) return;
      dragDelta = e.clientX - startX;
      track.style.transform = `translateX(${-getOffset(current)+dragDelta}px)`;
    });
    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging=false; track.style.transition='';
      if (dragDelta < -60) goTo(current+1);
      else if (dragDelta > 60) goTo(current-1);
      else goTo(current);
      dragDelta=0;
    });
    track.addEventListener('touchstart', e => { startX=e.touches[0].clientX; track.style.transition='none'; }, {passive:true});
    track.addEventListener('touchmove', e => {
      dragDelta = e.touches[0].clientX - startX;
      track.style.transform = `translateX(${-getOffset(current)+dragDelta}px)`;
    }, {passive:true});
    track.addEventListener('touchend', () => {
      track.style.transition='';
      if (dragDelta < -60) goTo(current+1);
      else if (dragDelta > 60) goTo(current-1);
      else goTo(current);
      dragDelta=0;
    });

    goTo(0);
    window.addEventListener('resize', () => goTo(current));
  })();

  // SCROLL REVEAL
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } });
  }, { threshold: 0.15 });
  reveals.forEach(el => observer.observe(el));

  // ✦ STAR DUST EFFECT
  const canvas = document.getElementById('dustCanvas');
  const ctx = canvas.getContext('2d');
  function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const particles = [];
  const SHAPES = ['✦','✧','★','·','⋆','*','✶','✸'];
  const COLORS = ['#c9a84c','#e8d5a0','#ffffff','#f0e6c8','#ffd97d','#ffe8a0','#f5c842'];

  function spawnBurst(x, y) {
    const count = 20 + Math.floor(Math.random() * 12);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - Math.random() * 2.5,
        alpha: 1,
        size: 9 + Math.random() * 16,
        decay: 0.013 + Math.random() * 0.017,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.18,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        gravity: 0.055 + Math.random() * 0.045,
        scale: 0.7 + Math.random() * 0.7,
      });
    }
  }

  function animateDust() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      p.vy += p.gravity; p.vx *= 0.97;
      p.alpha -= p.decay; p.rotation += p.spin;
      if (p.alpha <= 0) { particles.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(p.scale, p.scale);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.font = `${p.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.shape, 0, 0);
      ctx.restore();
    }
    requestAnimationFrame(animateDust);
  }
  animateDust();

  // PC — click (음악 버튼 제외)
  document.addEventListener('click', e => {
    if (e.target.id === 'musicBtn') return;
    spawnBurst(e.clientX, e.clientY);
  });

  // Mobile — touch (음악 버튼 제외)
  document.addEventListener('touchstart', e => {
    if (e.target.id === 'musicBtn') return;
    Array.from(e.changedTouches).forEach(t => spawnBurst(t.clientX, t.clientY));
  }, { passive: true });

                    // MUSIC PLAYER - 발랄한 발라드
  (function() {
    const btn = document.getElementById('musicBtn');
    let playing = false;
    let ctx = null;
    let masterGain = null;
    let timers = [];

    function setPlaying(state) {
      playing = state;
      btn.textContent = playing ? '♫' : '♪';
      playing ? btn.classList.add('playing') : btn.classList.remove('playing');
    }

    function startAmbient() {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.42, ctx.currentTime + 2);
      masterGain.connect(ctx.destination);

      const BPM = 96; // 발랄하게 빠르게
      const BEAT = 60 / BPM;
      const BAR  = BEAT * 4;

      // 피아노 음색
      function piano(freq, when, dur, vol) {
        if (!ctx || !masterGain) return;
        [1, 2, 3].forEach((harmonic, i) => {
          const osc = ctx.createOscillator();
          const g   = ctx.createGain();
          osc.type = i === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq * harmonic, when);
          const v = vol * [1, 0.35, 0.1][i];
          const decay = dur * [1, 0.5, 0.3][i];
          g.gain.setValueAtTime(0, when);
          g.gain.linearRampToValueAtTime(v, when + 0.012);
          g.gain.exponentialRampToValueAtTime(v * 0.5, when + 0.1);
          g.gain.exponentialRampToValueAtTime(0.0001, when + decay);
          osc.connect(g); g.connect(masterGain);
          osc.start(when); osc.stop(when + decay + 0.05);
        });
      }

      // 기타 느낌 (밝은 플럭)
      function pluck(freq, when, vol) {
        if (!ctx || !masterGain) return;
        const osc = ctx.createOscillator();
        const g   = ctx.createGain();
        const f   = ctx.createBiquadFilter();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, when);
        f.type = 'lowpass'; f.frequency.value = 2000; f.Q.value = 2;
        g.gain.setValueAtTime(0, when);
        g.gain.linearRampToValueAtTime(vol, when + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0001, when + 0.5);
        osc.connect(f); f.connect(g); g.connect(masterGain);
        osc.start(when); osc.stop(when + 0.6);
      }

      // 현악 패드
      function strings(freq, when, dur, vol) {
        if (!ctx || !masterGain) return;
        [-1, 0, 1].forEach(dt => {
          const osc = ctx.createOscillator();
          const g   = ctx.createGain();
          const f   = ctx.createBiquadFilter();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq * Math.pow(2, dt/1200), when);
          f.type = 'lowpass'; f.frequency.value = 1100; f.Q.value = 0.4;
          g.gain.setValueAtTime(0, when);
          g.gain.linearRampToValueAtTime(vol, when + 0.6);
          g.gain.linearRampToValueAtTime(vol * 0.75, when + dur - 0.5);
          g.gain.linearRampToValueAtTime(0, when + dur);
          osc.connect(f); f.connect(g); g.connect(masterGain);
          osc.start(when); osc.stop(when + dur + 0.1);
        });
      }

      // 킥드럼
      function kick(when) {
        if (!ctx || !masterGain) return;
        const osc = ctx.createOscillator();
        const g   = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, when);
        osc.frequency.exponentialRampToValueAtTime(40, when + 0.12);
        g.gain.setValueAtTime(0, when);
        g.gain.linearRampToValueAtTime(0.55, when + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, when + 0.25);
        osc.connect(g); g.connect(masterGain);
        osc.start(when); osc.stop(when + 0.3);
      }

      // 스네어
      function snare(when) {
        if (!ctx || !masterGain) return;
        const buf  = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        const g   = ctx.createGain();
        const f   = ctx.createBiquadFilter();
        src.buffer = buf;
        f.type = 'highpass'; f.frequency.value = 1500;
        g.gain.setValueAtTime(0, when);
        g.gain.linearRampToValueAtTime(0.18, when + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, when + 0.15);
        src.connect(f); f.connect(g); g.connect(masterGain);
        src.start(when);
      }

      // 하이햇
      function hihat(when, vol) {
        if (!ctx || !masterGain) return;
        const buf  = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        const g   = ctx.createGain();
        const f   = ctx.createBiquadFilter();
        src.buffer = buf;
        f.type = 'highpass'; f.frequency.value = 8000;
        g.gain.setValueAtTime(0, when);
        g.gain.linearRampToValueAtTime(vol, when + 0.003);
        g.gain.exponentialRampToValueAtTime(0.0001, when + 0.05);
        src.connect(f); f.connect(g); g.connect(masterGain);
        src.start(when);
      }

      // ===== C장조 밝은 코드 진행 =====
      // C - G - Am - F (팝 발라드 왕도 진행)
      const chords = [
        { root: 130.81, notes: [261.63, 329.63, 392.00], bass: 65.41  }, // C
        { root: 196.00, notes: [293.66, 349.23, 392.00], bass: 98.00  }, // G
        { root: 110.00, notes: [261.63, 329.63, 440.00], bass: 110.00 }, // Am
        { root: 174.61, notes: [261.63, 349.23, 440.00], bass: 87.31  }, // F
      ];

      // 발랄한 멜로디 - 밝고 통통 튀는 느낌
      const melody = [
        // C
        {f:523.25, t:0.0},   {f:659.25, t:BEAT*0.5},
        {f:783.99, t:BEAT*1},{f:659.25, t:BEAT*1.5},
        {f:523.25, t:BEAT*2},{f:587.33, t:BEAT*2.75},
        {f:659.25, t:BEAT*3},{f:523.25, t:BEAT*3.5},
        // G
        {f:587.33, t:BAR+0},         {f:659.25, t:BAR+BEAT*0.5},
        {f:783.99, t:BAR+BEAT},      {f:880.00, t:BAR+BEAT*1.5},
        {f:783.99, t:BAR+BEAT*2},    {f:659.25, t:BAR+BEAT*2.75},
        {f:587.33, t:BAR+BEAT*3},    {f:523.25, t:BAR+BEAT*3.5},
        // Am
        {f:440.00, t:BAR*2+0},       {f:523.25, t:BAR*2+BEAT*0.5},
        {f:587.33, t:BAR*2+BEAT},    {f:659.25, t:BAR*2+BEAT*1.5},
        {f:523.25, t:BAR*2+BEAT*2},  {f:493.88, t:BAR*2+BEAT*2.75},
        {f:440.00, t:BAR*2+BEAT*3},  {f:493.88, t:BAR*2+BEAT*3.5},
        // F
        {f:523.25, t:BAR*3+0},       {f:587.33, t:BAR*3+BEAT*0.5},
        {f:659.25, t:BAR*3+BEAT},    {f:698.46, t:BAR*3+BEAT*1.5},
        {f:659.25, t:BAR*3+BEAT*2},  {f:587.33, t:BAR*3+BEAT*2.75},
        {f:523.25, t:BAR*3+BEAT*3},  {f:493.88, t:BAR*3+BEAT*3.5},
      ];

      const LOOP = BAR * 4;

      function playLoop(st) {
        if (!playing || !ctx || !masterGain) return;

        chords.forEach((ch, i) => {
          const w = st + i * BAR;
          // 현악 패드
          ch.notes.forEach(f => strings(f, w, BAR + 0.3, 0.022));
          strings(ch.root * 0.5, w, BAR + 0.3, 0.018);

          // 피아노 왼손 - 아르페지오 느낌
          [0, BEAT, BEAT*2, BEAT*3].forEach((bt, bi) => {
            piano(ch.bass, w + bt, 0.6, 0.07);
            piano(ch.notes[bi % ch.notes.length], w + bt + BEAT*0.5, 0.4, 0.04);
          });

          // 기타 코드 스트럼 (2, 4박)
          [BEAT, BEAT*3].forEach(bt => {
            ch.notes.forEach((f, ni) => pluck(f, w + bt + ni * 0.018, 0.04));
          });

          // 드럼 패턴
          for (let b = 0; b < 4; b++) {
            const bw = w + b * BEAT;
            kick(bw);                        // 1,2,3,4박 킥
            if (b === 1 || b === 3) snare(bw); // 2,4박 스네어
            // 8분음표 하이햇
            hihat(bw,          0.09);
            hihat(bw + BEAT*0.5, 0.06);
          }
        });

        // 멜로디
        melody.forEach(({f, t}) => piano(f, st + t, BEAT * 0.45, 0.065));

        const remaining = (st + LOOP - ctx.currentTime) * 1000;
        const t = setTimeout(() => {
          if (!playing || !ctx) return;
          playLoop(ctx.currentTime + 0.02);
        }, Math.max(remaining - 200, 50));
        timers.push(t);
      }

      const t0 = setTimeout(() => {
        if (!ctx) return;
        playLoop(ctx.currentTime + 0.1);
      }, 500);
      timers.push(t0);
    }

    function stopAmbient() {
      timers.forEach(t => { clearTimeout(t); clearInterval(t); });
      timers = [];
      if (ctx) { try { ctx.close(); } catch(e) {} ctx = null; masterGain = null; }
    }

    function toggle(e) {
      e.stopPropagation(); e.preventDefault();
      if (playing) { stopAmbient(); setPlaying(false); }
      else { startAmbient(); setPlaying(true); }
    }

    btn.addEventListener('click', toggle);
    btn.addEventListener('touchend', toggle);
  })();