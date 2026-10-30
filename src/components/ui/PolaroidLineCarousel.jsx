import React, { useState, useEffect, useRef, useCallback } from 'react';

/*
 * Polaroid Line Carousel — Adapted for KAMIBI® Memorial Reviews
 * Large instant photos pegged to a sagging botanical twine string. Drag the line
 * (or use the arrows / click any print) and the prints slide along it,
 * swinging on their pegs with realistic pendulum physics, inertia, and
 * settling back with a gentle overshoot; even at rest they sway in a light breeze.
 */

export function wrap(i, n) {
  return n ? ((i % n) + n) % n : 0;
}

export function clamp(v, a, b) {
  return Math.min(b, Math.max(a, v));
}

/** Height of a string sagging by `sag` between (0, y0) and (w, y0), at x. */
export function stringY(x, w, y0, sag) {
  const t = clamp(x / w, 0, 1);
  return y0 + 4 * sag * t * (1 - t);
}

/** Slope angle (radians) of the sagging string at x. */
export function stringSlopeAngle(x, w, sag) {
  if (w <= 0) return 0;
  const t = clamp(x / w, 0, 1);
  const dyDx = (4 * sag * (1 - 2 * t)) / w;
  return Math.atan(dyDx) * 0.35;
}

/** Critically damped / slightly underdamped smooth spring toward target. */
export function springStep(x, v, target, dt, k = 58) {
  const c = 1.82 * Math.sqrt(k);
  const nv = v + (k * (target - x) - c * v) * dt;
  return [x + nv * dt, nv];
}

/**
 * Pendulum swing physics for each Polaroid print on its peg.
 * lineVel is the prints' horizontal speed (px/s); a print lags behind the
 * motion due to inertia, is pulled back by gravity, and oscillates before settling.
 */
export function swingStep(a, w, lineVel, dt, gain) {
  const gravityRestore = -30 * a;
  const airDamping = -2.85 * w;
  const inertialDrive = lineVel * 0.0046 * gain;
  const nw = w + (gravityRestore + airDamping + inertialDrive) * dt;
  return [clamp(a + nw * dt, -0.68, 0.68), nw];
}

/** Index of the print nearest the centre for a line offset. */
export function nearestAt(off, spacing, n) {
  return clamp(Math.round(off / spacing), 0, Math.max(0, n - 1));
}

export function pad2(n) {
  return n < 10 ? '0' + n : String(n);
}

/* ------------------------------------------------------- fallback painted landscapes */

const PALETTES = {
  dawn: { top: '#e7b7a5', bottom: '#f8e8d6', sun: '#fff4df', far: '#d2b2bb', near: '#3a2a3b', mist: '255,240,232' },
  alpine: { top: '#7ea5c8', bottom: '#e3ecf2', sun: '#ffffff', far: '#a9bfd0', near: '#1c3044', mist: '236,244,250' },
  dusk: { top: '#2a2450', bottom: '#ef8d60', sun: '#ffd9a6', far: '#93607c', near: '#18121f', mist: '255,196,160' },
  mist: { top: '#c4d0cb', bottom: '#eef1ec', sun: '#ffffff', far: '#aebcb5', near: '#2c3a33', mist: '246,248,245' },
};

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hexRgb(h) {
  const v = parseInt(h.replace('#', ''), 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

function mixRgb(a, b, t) {
  const A = hexRgb(a);
  const B = hexRgb(b);
  return 'rgb(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ')';
}

function paintLandscape(seed, palette = 'dawn', w = 1200, h = 900) {
  if (typeof document === 'undefined') return '';
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d');
  if (!g) return '';
  const P = PALETTES[palette] ?? PALETTES.dawn;
  const r = mulberry32(seed * 104729 + 7);

  const sky = g.createLinearGradient(0, 0, 0, h * 0.72);
  sky.addColorStop(0, P.top);
  sky.addColorStop(1, P.bottom);
  g.fillStyle = sky;
  g.fillRect(0, 0, w, h);

  const sx = w * (0.22 + r() * 0.56);
  const sy = h * (0.26 + r() * 0.16);
  const halo = g.createRadialGradient(sx, sy, 0, sx, sy, w * 0.45);
  halo.addColorStop(0, 'rgba(' + hexRgb(P.sun).join(',') + ',.85)');
  halo.addColorStop(0.08, 'rgba(' + hexRgb(P.sun).join(',') + ',.55)');
  halo.addColorStop(1, 'rgba(' + hexRgb(P.sun).join(',') + ',0)');
  g.fillStyle = halo;
  g.fillRect(0, 0, w, h);

  g.fillStyle = P.sun;
  g.beginPath();
  g.arc(sx, sy, h * 0.045, 0, Math.PI * 2);
  g.fill();

  const layers = 5;
  for (let L = 0; L < layers; L++) {
    const k = L / (layers - 1);
    const base = h * (0.42 + k * 0.4);
    const amp = h * (0.07 + k * 0.1);
    const ph = [r(), r(), r(), r()].map((v) => v * Math.PI * 2);
    const fr = [1.3 + r(), 3.1 + r() * 2, 7 + r() * 4, 17 + r() * 8];
    const ridge = (x) => {
      const u = x / w;
      return (
        base -
        amp *
          (0.55 * Math.sin(u * fr[0] + ph[0]) +
            0.28 * Math.sin(u * fr[1] + ph[1]) +
            0.12 * Math.abs(Math.sin(u * fr[2] + ph[2])) +
            0.05 * Math.sin(u * fr[3] + ph[3]))
      );
    };
    const mist = g.createLinearGradient(0, base - amp * 1.4, 0, base + amp * 0.4);
    mist.addColorStop(0, 'rgba(' + P.mist + ',0)');
    mist.addColorStop(1, 'rgba(' + P.mist + ',' + (0.55 - k * 0.35).toFixed(2) + ')');
    g.fillStyle = mist;
    g.fillRect(0, base - amp * 1.4, w, amp * 1.8);

    const body = g.createLinearGradient(0, base - amp, 0, h);
    body.addColorStop(0, mixRgb(P.far, P.near, Math.pow(k, 1.3)));
    body.addColorStop(1, mixRgb(P.far, P.near, Math.min(1, Math.pow(k, 1.3) + 0.18)));
    g.fillStyle = body;
    g.beginPath();
    g.moveTo(0, h);
    for (let x = 0; x <= w; x += 6) g.lineTo(x, ridge(x));
    g.lineTo(w, h);
    g.closePath();
    g.fill();
  }

  return c.toDataURL('image/jpeg', 0.86);
}

function useSlideImages(slides) {
  const key = slides.map((s) => s.image || (s.palette || 'dawn') + ':' + (s.seed ?? 1)).join('|');
  const [painted, setPainted] = useState(() => slides.map(() => ''));
  useEffect(() => {
    setPainted(
      slides.map((s, i) => (s.image ? '' : paintLandscape(s.seed ?? i + 1, s.palette || 'dawn')))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return slides.map((s, i) => s.image || painted[i] || '');
}

const PL_CSS = `
.pl-wrapper {
  position: relative;
  width: 100%;
  background: var(--pl-bg);
  color: var(--pl-ink);
  user-select: none;
  -webkit-user-select: none;
  outline: none;
}

.pl-stage {
  position: relative;
  width: 100%;
  overflow: hidden;
  touch-action: pan-y;
  cursor: grab;
}

.pl-stage[data-drag='1'] {
  cursor: grabbing;
}

.pl-string {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
  z-index: 1;
}

.pl-card {
  position: absolute;
  left: 0;
  top: 0;
  width: var(--pl-cw);
  transform-origin: 50% 4px;
  will-change: transform;
  cursor: pointer;
}

.pl-print {
  margin-top: 12px;
  background: #FFFDF9;
  padding: 14px 14px 18px;
  border-radius: 5px;
  border: 1px solid rgba(226, 214, 198, 0.9);
  box-shadow:
    0 2px 5px rgba(0, 0, 0, 0.06),
    0 22px 44px -14px rgba(28, 25, 22, 0.26);
  transition:
    transform 0.55s cubic-bezier(0.16, 1, 0.3, 1),
    filter 0.55s ease,
    box-shadow 0.55s ease;
}

.pl-card[data-on='1'] .pl-print {
  transform: scale(1.06);
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.09),
    0 32px 64px -12px rgba(28, 25, 22, 0.36);
}

.pl-card[data-on='0'] .pl-print {
  transform: scale(0.88);
  filter: saturate(0.78) brightness(0.96);
}

.pl-shot {
  position: relative;
  aspect-ratio: 1 / 0.96;
  overflow: hidden;
  background: #E8DED1;
  border-radius: 2px;
}

.pl-shot img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
  display: block;
  pointer-events: none;
  transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}

.pl-card[data-on='1']:hover .pl-shot img {
  transform: scale(1.05);
}

.pl-shot-edition {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(24, 32, 26, 0.78);
  backdrop-filter: blur(8px);
  color: #FAF7F2;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.pl-note {
  min-height: 52px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14px 8px 2px;
  text-align: center;
}

.pl-note-handwriting {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-weight: 600;
  font-size: 19px;
  line-height: 1.15;
  color: #2D2D2D;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.pl-note-author {
  font-family: 'Inter', sans-serif;
  font-size: 10.5px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7A8B7A;
  margin-top: 4px;
}

.pl-peg {
  position: absolute;
  left: 50%;
  top: -4px;
  width: 12px;
  height: 30px;
  margin-left: -6px;
  border-radius: 2.5px;
  background: linear-gradient(90deg, #b89464, #e2c79c 46%, #9f7c4e);
  box-shadow: 0 3px 7px rgba(0, 0, 0, 0.28);
  z-index: 3;
}

.pl-peg::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 10px;
  width: 6px;
  height: 3px;
  background: rgba(70, 50, 25, 0.55);
  border-radius: 1px;
}

/* ==========================================================================
   EDITORIAL QUOTE SHOWCASE — Separated cleanly below the hanging Polaroids
   ========================================================================== */
.pl-editorial-footer {
  max-width: 920px;
  margin: 1.25rem auto 0;
  padding: 0 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pl-quote-stage {
  min-height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: pl-fade-up 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
}

.pl-quote-meta-top {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.85rem;
}

.pl-quote-stars {
  color: #C4A97D;
  font-size: 0.85rem;
  letter-spacing: 3px;
}

.pl-quote-sep {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #C4A97D;
  opacity: 0.6;
}

.pl-quote-edition-tag {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #5A7A5A;
}

.pl-editorial-quote {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-weight: 400;
  font-size: clamp(1.55rem, 2.6vw, 2.25rem);
  line-height: 1.38;
  color: #2D2D2D;
  max-width: 800px;
  margin: 0 auto 1.15rem;
  letter-spacing: -0.01em;
}

.pl-author-signature {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  font-family: 'Inter', sans-serif;
  font-size: 0.82rem;
  color: #6B6560;
}

.pl-author-signature strong {
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.76rem;
  color: #2D2D2D;
}

.pl-verified-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.2rem 0.65rem;
  background: rgba(90, 122, 90, 0.1);
  color: #5A7A5A;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 600;
}

/* Controls Row below Quote */
.pl-controls-row {
  margin-top: 1.65rem;
  display: inline-flex;
  align-items: center;
  gap: 1.25rem;
  padding: 0.45rem 0.65rem;
  background: rgba(255, 253, 249, 0.75);
  border: 1px solid rgba(232, 222, 209, 0.9);
  border-radius: 999px;
  box-shadow: 0 8px 24px rgba(26, 26, 26, 0.04);
}

.pl-btn {
  appearance: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid #E8DED1;
  background: #FFFDF9;
  color: #2D2D2D;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.pl-btn:hover {
  background: #2D2D2D;
  border-color: #2D2D2D;
  color: #FFFDF9;
  transform: scale(1.06);
}

.pl-dots {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pl-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: rgba(196, 169, 125, 0.38);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.pl-dot.active {
  width: 24px;
  background: #2D2D2D;
}

.pl-count {
  font-family: 'Inter', monospace;
  font-weight: 500;
  font-size: 11.5px;
  letter-spacing: 0.12em;
  color: #8B9E8B;
  padding: 0 4px;
}

.pl-count b {
  color: #2D2D2D;
  font-weight: 600;
}

.pl-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@keyframes pl-fade-up {
  from {
    transform: translateY(14px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 680px) {
  .pl-editorial-quote {
    font-size: 1.35rem;
  }
  .pl-quote-stage {
    min-height: 170px;
  }
}
`;

export function PolaroidLineCarousel({
  slides = [],
  height = 540,
  cardWidth = 340,
  sag = 48,
  swing = 1.35,
  autoplay = 5400,
  string = '#B59E7A',
  background = 'transparent',
  ink = '#2D2D2D',
  onChange,
  className,
  style,
  ariaLabel = 'Carrusel de recuerdos y reseñas Kamibi',
}) {
  const n = slides.length;
  const srcs = useSlideImages(slides);
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [size, setSize] = useState({ w: 1400, h: Number(height) || 540, cw: cardWidth });
  const stageRef = useRef(null);
  const pathRef = useRef(null);
  const shadowPathRef = useRef(null);
  const cards = useRef([]);
  const sim = useRef({ off: 0, vel: 0, target: 0, a: [], w: [] });
  const drag = useRef(null);
  const lastTouch = useRef(0);
  const activeRef = useRef(0);
  const opts = useRef({ sag, swing });
  opts.current = { sag, swing };

  const spacing = size.cw * 1.14;
  const goTo = useCallback(
    (i) => {
      const nextIdx = clamp(i, 0, n - 1);
      sim.current.target = nextIdx * spacing;
      if (sim.current.w[nextIdx] !== undefined) {
        const dir = nextIdx > activeRef.current ? 1 : -1;
        sim.current.w[nextIdx] = (sim.current.w[nextIdx] || 0) + dir * 0.24;
      }
    },
    [n, spacing]
  );

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(() => {
      const r = stage.getBoundingClientRect();
      // Allow large Polaroids on desktop while scaling gracefully on mobile
      const cw = Math.round(Math.max(220, Math.min(cardWidth, r.width * 0.68)));
      setSize({ w: r.width, h: r.height, cw });
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, [cardWidth]);

  useEffect(() => {
    sim.current.target = activeRef.current * spacing;
    sim.current.off = activeRef.current * spacing;
  }, [spacing]);

  useEffect(() => {
    onChange?.(active);
  }, [active, onChange]);

  // Physics loop running at 60/120fps directly on DOM nodes
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let visible = true;
    let raf = 0;
    let prev = performance.now();
    const S = sim.current;

    const frame = (now) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.033, (now - prev) / 1000);
      prev = now;
      const { w, cw } = size;
      const y0 = 28;
      const d = drag.current;
      let lineVel;
      if (d && d.moved) {
        lineVel = d.v * 1000;
      } else {
        const before = S.off;
        [S.off, S.vel] = springStep(S.off, S.vel, S.target, dt);
        lineVel = -(S.off - before) / Math.max(dt, 1e-3);
      }
      const o = opts.current;
      const g = reduce ? 0 : o.swing;
      const near = nearestAt(S.off, spacing, n);

      // Dynamic string sag reacts subtly to velocity
      const dynamicSag = o.sag + Math.min(12, Math.abs(lineVel) * 0.004);

      for (let i = 0; i < n; i++) {
        const el = cards.current[i];
        if (!el) continue;
        const x = w / 2 + i * spacing - S.off;
        if (x < -cw * 1.6 || x > w + cw * 1.6) {
          el.style.visibility = 'hidden';
          continue;
        }
        el.style.visibility = 'visible';
        let a = S.a[i] || 0;
        let av = S.w[i] || 0;
        [a, av] = swingStep(a, av, lineVel, dt, g);
        if (g) {
          const breeze = Math.sin(now / 1150 + i * 1.85) * 0.0014 * g;
          const restingTilt = stringSlopeAngle(x, w, dynamicSag) * 0.15;
          a += breeze + (restingTilt - a) * 0.02;
        }
        S.a[i] = a;
        S.w[i] = av;
        const y = stringY(x, w, y0, dynamicSag) - 4;
        el.style.transform =
          'translate3d(' +
          (x - cw / 2).toFixed(1) +
          'px,' +
          y.toFixed(1) +
          'px,0) rotate(' +
          a.toFixed(4) +
          'rad)';
        el.style.zIndex = String(i === near ? n + 2 : n - Math.abs(i - near));
      }

      const dAttr =
        'M0 ' + y0 + ' Q' + w / 2 + ' ' + (y0 + 2 * dynamicSag) + ' ' + w + ' ' + y0;
      pathRef.current?.setAttribute('d', dAttr);
      shadowPathRef.current?.setAttribute(
        'd',
        'M0 ' + (y0 + 6) + ' Q' + w / 2 + ' ' + (y0 + 2 * dynamicSag + 8) + ' ' + w + ' ' + (y0 + 6)
      );

      if (near !== activeRef.current) {
        activeRef.current = near;
        setActive(near);
      }
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) {
        prev = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(stage);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [size, spacing, n]);

  // Autoplay
  useEffect(() => {
    if (!autoplay || n < 2) return;
    const t = window.setInterval(() => {
      if (document.hidden || drag.current || performance.now() - lastTouch.current < autoplay)
        return;
      goTo(activeRef.current >= n - 1 ? 0 : activeRef.current + 1);
    }, autoplay);
    return () => window.clearInterval(t);
  }, [autoplay, n, goTo]);

  const onDown = (e) => {
    lastTouch.current = performance.now();
    drag.current = {
      x: e.clientX,
      off: sim.current.off,
      lx: e.clientX,
      lt: e.timeStamp,
      v: 0,
      moved: false,
    };
  };

  const onMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      setDragging(true);
      stageRef.current?.setPointerCapture?.(e.pointerId);
    }
    if (!d.moved) return;
    const dt = Math.max(1, e.timeStamp - d.lt);
    d.v = 0.7 * ((e.clientX - d.lx) / dt) + 0.3 * d.v;
    d.lx = e.clientX;
    d.lt = e.timeStamp;
    const max = (n - 1) * spacing;
    let off = d.off - dx;
    if (off < 0) off *= 0.35;
    if (off > max) off = max + (off - max) * 0.35;
    sim.current.off = off;
  };

  const onUp = (e) => {
    const d = drag.current;
    drag.current = null;
    lastTouch.current = performance.now();
    if (!d) return;
    if (d.moved) {
      setDragging(false);
      sim.current.vel = -d.v * 1000;
      goTo(nearestAt(sim.current.off - d.v * 180, spacing, n));
      return;
    }
    const card = e.target.closest('[data-i]');
    if (card) {
      const idx = Number(card.getAttribute('data-i'));
      sim.current.w[idx] = (sim.current.w[idx] || 0) + 0.3;
      goTo(idx);
    }
  };

  const step = (dir) => {
    lastTouch.current = performance.now();
    goTo(clamp(activeRef.current + dir, 0, n - 1));
  };

  const onKey = (e) => {
    if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else return;
    e.preventDefault();
  };

  const s = slides[active] || {};
  // Responsive stage height based on actual card width so the bottom of the Polaroid never clips
  const computedStageHeight = Math.max(Number(height) || 520, Math.round(size.cw * 1.48 + 90));

  return (
    <div
      className={['pl-wrapper', className].filter(Boolean).join(' ')}
      style={{
        '--pl-bg': background,
        '--pl-ink': ink,
        '--pl-cw': size.cw + 'px',
        ...style,
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={onKey}
    >
      <style>{PL_CSS}</style>

      {/* Full-Width Hanging Polaroid Stage */}
      <div
        ref={stageRef}
        className="pl-stage"
        style={{ height: `${computedStageHeight}px` }}
        data-drag={dragging ? '1' : '0'}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        {/* Sagging Botanical Twine & Shadow */}
        <svg className="pl-string" aria-hidden="true">
          <path
            ref={shadowPathRef}
            fill="none"
            stroke="rgba(0,0,0,0.05)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            ref={pathRef}
            fill="none"
            stroke={string}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* Hanging Polaroid Prints */}
        {slides.map((sl, i) => (
          <div
            key={i}
            className="pl-card"
            data-i={i}
            data-on={i === active ? '1' : '0'}
            ref={(el) => {
              cards.current[i] = el;
            }}
            aria-hidden={i === active ? undefined : true}
          >
            <div className="pl-print">
              <div className="pl-shot">
                {srcs[i] ? (
                  <img src={srcs[i]} alt={sl.alt || sl.title || ''} draggable={false} />
                ) : null}
                {sl.edition && <span className="pl-shot-edition">{sl.edition}</span>}
              </div>
              <div className="pl-note">
                <span className="pl-note-handwriting">“{sl.title || ''}”</span>
                {sl.author && <span className="pl-note-author">{sl.author}</span>}
              </div>
            </div>
            <div className="pl-peg" />
          </div>
        ))}
      </div>

      {/* Editorial Quote Showcase cleanly separated below the Polaroids */}
      <div className="pl-editorial-footer">
        <div className="pl-quote-stage" key={active}>
          <div className="pl-quote-meta-top">
            <span className="pl-quote-stars">★★★★★</span>
            {s.edition && (
              <>
                <span className="pl-quote-sep" />
                <span className="pl-quote-edition-tag">Edición {s.edition}</span>
              </>
            )}
          </div>

          {s.quote || s.title ? (
            <blockquote className="pl-editorial-quote">
              “{s.quote || s.title}”
            </blockquote>
          ) : null}

          <div className="pl-author-signature">
            {s.author && <strong>{s.author}</strong>}
            {s.location && <span>— {s.location}</span>}
            <span className="pl-verified-pill">✓ Familia Kamibi Verificada</span>
          </div>
        </div>

        {/* Minimal Gallery Navigation Bar */}
        <div className="pl-controls-row">
          <button
            type="button"
            className="pl-btn"
            aria-label="Reseña anterior"
            onClick={() => step(-1)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3 5 8l5 5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>

          <div className="pl-dots" role="tablist" aria-label="Seleccionar recuerdo">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={idx === active}
                aria-label={`Recuerdo ${idx + 1}`}
                className={`pl-dot ${idx === active ? 'active' : ''}`}
                onClick={() => {
                  lastTouch.current = performance.now();
                  goTo(idx);
                }}
              />
            ))}
          </div>

          <span className="pl-count" aria-hidden="true">
            <b>{pad2(active + 1)}</b> / {pad2(n)}
          </span>

          <button
            type="button"
            className="pl-btn"
            aria-label="Siguiente reseña"
            onClick={() => step(1)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="m6 3 5 5-5 5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </div>

      <div className="pl-sr" aria-live="polite">
        {'Recuerdo ' + (active + 1) + ' de ' + n + (s.title ? ': ' + s.title : '')}
      </div>
    </div>
  );
}

export default PolaroidLineCarousel;
