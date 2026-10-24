import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import './style.css';
import { setupSections } from './sections.js';

gsap.registerPlugin(ScrollTrigger);

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const $ = (s) => document.querySelector(s);
const $$ = (s) => gsap.utils.toArray(s);

history.scrollRestoration = 'manual';
scrollTo(0, 0);

// ---------- smooth scroll ----------

const lenis = reduced ? null : new Lenis({ lerp: 0.085 });
if (lenis) {
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

const expoOut = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const target = a.getAttribute('href') === '#top' ? 0 : $(a.getAttribute('href'));
  if (target === null) return;
  e.preventDefault();
  if (lenis) lenis.scrollTo(target, { duration: 1.8, easing: expoOut });
  else scrollTo({ top: target === 0 ? 0 : target.offsetTop });
});

// The header steps out of the way while reading down and returns on any scroll up.
const head = $('.site-head');
let lastY = 0;
addEventListener(
  'scroll',
  () => {
    const y = scrollY;
    head.classList.toggle('is-hidden', y > lastY && y > 160);
    lastY = y;
  },
  { passive: true },
);

// Nav labels get a gold twin for the roll-over hover.
for (const a of document.querySelectorAll('.site-nav a')) {
  const t = a.textContent.trim();
  a.innerHTML = `<span>${t}</span><span aria-hidden="true">${t}</span>`;
}

// ---------- intro + hero ----------

const frame = $('.hero-frame');
const inner = $('.hero-inner');

// Start states live in JS, not CSS: GSAP would read a CSS translate as px and stack it under yPercent.
gsap.set('.li', { yPercent: 110, rotate: 2.5 });
gsap.set('.hero-bar', { scaleX: 0 });

const headIn = () =>
  gsap.fromTo('.site-head > *', { y: -8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power2.out', stagger: 0.06 });

function heroIn(withHead = true) {
  return gsap
    .timeline()
    .to('.li', { yPercent: 0, rotate: 0, duration: 1.5, ease: 'expo.out', stagger: 0.09 })
    .fromTo('.hero-eyebrow, .hero-cn', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, ease: 'power3.out', stagger: 0.12 }, 0.25)
    .fromTo('.hero-foot > :not(.hero-bar)', { y: -8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power2.out', stagger: 0.06 }, 0.4)
    .to('.hero-bar', { scaleX: 1, duration: 1.4, ease: 'expo.inOut' }, 0.3)
    .add(withHead ? headIn() : gsap.timeline(), 0.4);
}

function aperture() {
  return gsap
    .timeline()
    .set(inner, { scale: 1.3 })
    .to('.corner', { autoAlpha: 1, duration: 0.6, stagger: 0.08 }, 0.15)
    .to('.intro-tag', { autoAlpha: 1, duration: 0.6, stagger: 0.1 }, '<0.2')
    .to('.intro-line', { scaleX: 1, duration: 1.2, ease: 'expo.inOut' }, 0.5)
    .set(frame, { clipPath: 'inset(50% 15% 50% 15%)' })
    .to(frame, { clipPath: 'inset(24% 15% 24% 15%)', duration: 1.1, ease: 'expo.inOut' }, '+=0.15')
    .to('.intro-line', { autoAlpha: 0, duration: 0.5 }, '<0.15')
    .to(inner, { scale: 1.18, duration: 1.1, ease: 'expo.inOut' }, '<-0.15')
    // the title rises inside the aperture, so the window has something to frame
    .add(heroIn(false), '<0.5')
    .to(frame, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, '<1.1')
    .to(inner, { scale: 1, duration: 1.8, ease: 'expo.inOut' }, '<')
    .to('.corner, .intro-tag', { autoAlpha: 0, duration: 0.5 }, '<0.2')
    // chrome arrives only once the frame is fully open
    .add(headIn(), '<0.9');
}

function done() {
  $('.intro')?.remove();
  gsap.set(frame, { clearProps: 'clipPath' });
  frame.style.clipPath = 'none';
  lenis?.start();
  setupScroll();
}

function start() {
  // Reloads can restore an old offset after load; the reel always opens at the top.
  scrollTo(0, 0);
  lenis?.scrollTo(0, { immediate: true, force: true });
  let seen = false;
  try {
    seen = sessionStorage.getItem('zsy-intro') === '1';
    sessionStorage.setItem('zsy-intro', '1');
  } catch {}

  // Full reel once per visit; a reload or reduced motion gets the title settle only.
  if (reduced || seen) {
    $('.intro')?.remove();
    frame.style.clipPath = 'none';
    const tl = heroIn().eventCallback('onComplete', done);
    if (reduced) tl.progress(1);
    return;
  }
  lenis?.stop();
  aperture().eventCallback('onComplete', done);
}

// Wait for the display face so the reveal never swaps fonts mid-motion.
Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]).then(start);

// ---------- pointer: the glow leans toward the cursor ----------

if (finePointer && !reduced) {
  const gx = gsap.quickTo('.hero-glow-wrap', 'x', { duration: 2.4, ease: 'power3.out' });
  const gy = gsap.quickTo('.hero-glow-wrap', 'y', { duration: 2.4, ease: 'power3.out' });
  addEventListener('pointermove', (e) => {
    gx((e.clientX / innerWidth - 0.5) * 120);
    gy((e.clientY / innerHeight - 0.5) * 80);
  });
}

// ---------- scroll ----------

let scrollReady = false;
function setupScroll() {
  if (scrollReady || reduced) return;
  scrollReady = true;

  // As the content sheet rises over the sticky hero, the hero sinks back and dims.
  gsap
    .timeline({ scrollTrigger: { trigger: '.content', start: 'top bottom', end: 'top top', scrub: true } })
    .to('.hero-main', { yPercent: -22, ease: 'none' }, 0)
    .to(frame, { scale: 0.92, ease: 'none' }, 0)
    .to('.hero-dim', { opacity: 0.8, ease: 'none' }, 0);

  setupSections({ finePointer });

  for (const el of $$('[data-reveal]')) {
    gsap.from(el, {
      y: 48,
      autoAlpha: 0,
      duration: 1.3,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  }
}
