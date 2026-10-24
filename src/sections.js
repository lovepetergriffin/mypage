import { gsap } from 'gsap';

const segmenter = 'Segmenter' in Intl ? new Intl.Segmenter('zh', { granularity: 'word' }) : null;

// Wraps every word (Chinese via Intl.Segmenter, else per character) in a span; inline elements stay one unit.
function splitWords(el) {
  const words = [];
  for (const node of [...el.childNodes]) {
    if (node.nodeType !== Node.TEXT_NODE) {
      node.classList.add('w');
      words.push(node);
      continue;
    }
    const frag = document.createDocumentFragment();
    const parts = segmenter ? [...segmenter.segment(node.textContent)].map((s) => s.segment) : [...node.textContent];
    for (const part of parts) {
      if (!part.trim()) {
        frag.append(part);
        continue;
      }
      const s = document.createElement('span');
      s.className = 'w';
      s.textContent = part;
      frag.append(s);
      words.push(s);
    }
    node.replaceWith(frag);
  }
  return words;
}

function splitChars(el) {
  const chars = [];
  const walk = (parent) => {
    for (const node of [...parent.childNodes]) {
      if (node.nodeType !== Node.TEXT_NODE) {
        walk(node);
        continue;
      }
      const frag = document.createDocumentFragment();
      for (const c of node.textContent) {
        if (!c.trim()) {
          frag.append(c);
          continue;
        }
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = c;
        frag.append(s);
        chars.push(s);
      }
      node.replaceWith(frag);
    }
  };
  walk(el);
  return chars;
}

// ---------- section heads: label rises, hairline draws across ----------

function sectionHeads() {
  for (const head of document.querySelectorAll('.section-head')) {
    const rule = document.createElement('i');
    rule.className = 'sh-rule';
    head.append(rule);
    gsap
      .timeline({ scrollTrigger: { trigger: head, start: 'top 88%', once: true } })
      .from(head.querySelectorAll('span'), { yPercent: 100, autoAlpha: 0, duration: 1, ease: 'expo.out', stagger: 0.08 })
      .from(rule, { scaleX: 0, duration: 1.6, ease: 'expo.inOut' }, 0);
  }
}

// ---------- statements: words light up as the reader scrolls through ----------

function statements() {
  for (const el of document.querySelectorAll('[data-light]')) {
    const words = splitWords(el);
    gsap.fromTo(
      words,
      { opacity: 0.14 },
      {
        opacity: 1,
        ease: 'none',
        stagger: 0.1,
        scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 },
      },
    );
  }
}

// ---------- work rows: rules draw in; a preview card trails the cursor ----------

const posters = {
  radar: `
    <div class="wp-art wp-radar">
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r="88" /><circle cx="100" cy="100" r="62" /><circle cx="100" cy="100" r="36" />
        <path d="M100 8v184M8 100h184" />
        <circle class="blip" cx="138" cy="64" r="3" /><circle class="blip" cx="58" cy="126" r="2.4" /><circle class="blip" cx="122" cy="148" r="2" />
      </svg>
      <div class="sweep"></div>
    </div>`,
  daily: `
    <div class="wp-art wp-daily">
      <p class="wp-date">08:00 — Daily</p>
      <p class="wp-head">AI 码力日报</p>
      <i style="--w: 92%"></i><i style="--w: 78%"></i><i style="--w: 86%"></i><i style="--w: 54%"></i>
      <i style="--w: 88%"></i><i style="--w: 70%"></i>
    </div>`,
  vps: `
    <div class="wp-art wp-vps">
      ${[38, 62, 45, 80, 52, 30, 68, 92, 48, 58, 35, 74, 44, 66, 28, 56, 84, 40, 60, 50]
        .map((h, i) => `<i style="--h: ${h}%"${i === 7 ? ' class="hi"' : ''}></i>`)
        .join('')}
    </div>`,
  site: `
    <div class="wp-art wp-site">
      <i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i>
      <span class="wp-line"></span>
      <span class="wp-word">zsyvoid</span>
    </div>`,
};

function workRows(finePointer) {
  const rows = [...document.querySelectorAll('.work-list li')];

  for (const li of rows) {
    const rule = document.createElement('i');
    rule.className = 'wl-rule';
    li.append(rule);
    gsap
      .timeline({ scrollTrigger: { trigger: li, start: 'top 90%', once: true } })
      .from(rule, { scaleX: 0, duration: 1.4, ease: 'expo.inOut' })
      .from(li.querySelector('a').children, { yPercent: 60, autoAlpha: 0, duration: 1.1, ease: 'expo.out', stagger: 0.06 }, 0.15);
  }

  if (!finePointer) return;

  const keys = rows.map((li) => li.dataset.preview);
  const wp = document.createElement('div');
  wp.className = 'wp';
  wp.setAttribute('aria-hidden', 'true');
  wp.innerHTML = `<div class="wp-track">${keys
    .map((k, i) => `<div class="wp-card">${posters[k]}<div class="wp-cap mono"><span>0${i + 1}</span><span>${rows[i].querySelector('.w-name').textContent}</span></div></div>`)
    .join('')}</div>`;
  document.body.append(wp);
  const track = wp.firstElementChild;

  gsap.set(wp, { xPercent: -50, yPercent: -50, clipPath: 'inset(50% 50% 50% 50%)', scale: 0.85 });
  const mx = gsap.quickTo(wp, 'x', { duration: 0.75, ease: 'power3.out' });
  const my = gsap.quickTo(wp, 'y', { duration: 0.75, ease: 'power3.out' });
  const rot = gsap.quickTo(wp, 'rotation', { duration: 0.9, ease: 'power3.out' });

  let lastX = 0;
  let vx = 0;
  let shown = false;
  addEventListener('pointermove', (e) => {
    mx(e.clientX);
    my(e.clientY);
    vx = e.clientX - lastX;
    lastX = e.clientX;
  });
  // tilt with horizontal velocity, decaying back to level when the cursor rests
  gsap.ticker.add(() => {
    rot(gsap.utils.clamp(-10, 10, vx * 0.45));
    vx *= 0.82;
  });

  const list = document.querySelector('.work-list');
  rows.forEach((li, i) => {
    li.addEventListener('pointerenter', (e) => {
      if (!shown) {
        // jump to the cursor before opening, so the card never flies in from the last spot
        gsap.set(wp, { x: e.clientX, y: e.clientY });
        mx(e.clientX);
        my(e.clientY);
      }
      shown = true;
      gsap.to(track, { yPercent: -100 * i, duration: 0.9, ease: 'expo.out', overwrite: true });
      gsap.to(wp, { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, autoAlpha: 1, duration: 0.8, ease: 'expo.out', overwrite: 'auto' });
    });
  });
  list.addEventListener('pointerleave', () => {
    shown = false;
    gsap.to(wp, { clipPath: 'inset(50% 50% 50% 50%)', scale: 0.85, duration: 0.6, ease: 'expo.inOut', overwrite: 'auto' });
  });
}

// ---------- contact: the headline rises letter by letter with the scroll ----------

function contactTitle() {
  const title = document.querySelector('.contact-title');
  const chars = splitChars(title);
  gsap
    .timeline({ scrollTrigger: { trigger: title, start: 'top 92%', end: 'clamp(top 38%)', scrub: 0.8 } })
    .fromTo(chars, { yPercent: 115, rotate: 9 }, { yPercent: 0, rotate: 0, ease: 'power3.out', stagger: 0.08 })
    .fromTo('.contact-rule', { scaleX: 0 }, { scaleX: 1, ease: 'power2.inOut' }, '-=0.3');
}

export function setupSections({ finePointer }) {
  sectionHeads();
  statements();
  workRows(finePointer);
  contactTitle();
}
