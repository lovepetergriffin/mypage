import { gsap } from 'gsap';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Each variant renders its own loader markup on top of the shared hero.
const loaders = {
  a: `
    <div class="loader ld-a">
      <div class="ld-meta mono"><span>zsyvoid</span><span>Loading</span></div>
      <div class="ld-count-mask"><span class="ld-count">000</span></div>
      <div class="ld-bar"></div>
    </div>`,
  b: `
    <div class="loader ld-b">
      <div class="ct ct-top"></div>
      <div class="ct ct-bot"></div>
      <div class="ld-word">
        <div class="ld-name">${[...'zsyvoid'].map((c) => `<span>${c}</span>`).join('')}</div>
        <div class="ld-rule"></div>
        <div class="ld-sub mono">Sean — Independent builder</div>
      </div>
    </div>`,
  c: `
    <div class="loader ld-c">
      <div class="ld-line"></div>
      <i class="ld-corner tl"></i><i class="ld-corner tr"></i>
      <i class="ld-corner bl"></i><i class="ld-corner br"></i>
      <span class="ld-tag t1 mono">zsyvoid / Reel 01</span>
      <span class="ld-tag t2 mono">Sean — 2026</span>
    </div>`,
};

// The settle-in shared by every variant once its loader clears.
function heroIn(q) {
  return gsap
    .timeline()
    .fromTo(q('.li'), { yPercent: 110, rotate: 2.5 }, { yPercent: 0, rotate: 0, duration: 1.5, ease: 'expo.out', stagger: 0.09 })
    .fromTo(q('.h-eyebrow, .h-cn'), { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, ease: 'power3.out', stagger: 0.12 }, 0.25)
    .fromTo(q('.h-nav > *, .h-foot > :not(.h-bar)'), { y: -8, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power2.out', stagger: 0.05 }, 0.4)
    .fromTo(q('.h-bar'), { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'expo.inOut' }, 0.3);
}

const timelines = {
  a(q) {
    const count = q('.ld-count')[0];
    const bar = q('.ld-bar')[0];
    const n = { v: 0 };
    const render = () => {
      count.textContent = String(Math.round(n.v)).padStart(3, '0');
      gsap.set(bar, { scaleX: n.v / 100 });
    };
    return gsap
      .timeline()
      .fromTo(q('.ld-meta'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 })
      .fromTo(q('.ld-count'), { yPercent: 100 }, { yPercent: 0, duration: 0.9, ease: 'expo.out' }, '<')
      .to(n, { v: 38, duration: 0.9, ease: 'power2.out', onUpdate: render })
      .to(n, { v: 74, duration: 0.8, ease: 'power2.inOut', onUpdate: render }, '+=0.18')
      .to(n, { v: 100, duration: 0.55, ease: 'power3.in', onUpdate: render }, '+=0.12')
      .to(q('.ld-count'), { yPercent: -105, duration: 0.7, ease: 'expo.in' }, '+=0.2')
      .to(q('.ld-meta'), { autoAlpha: 0, duration: 0.3 }, '<0.2')
      .to(q('.ld-a'), { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.15, ease: 'expo.inOut' })
      .to(q('.ld-bar'), { autoAlpha: 0, duration: 0.2 }, '<')
      .fromTo(q('.hero-inner'), { y: '6cqw' }, { y: 0, duration: 1.4, ease: 'expo.out' }, '<0.35')
      .add(heroIn(q), '<0.1');
  },

  b(q) {
    const chars = q('.ld-name span');
    return gsap
      .timeline()
      .to(chars, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.06 }, 0.2)
      .to(q('.ld-rule'), { scaleX: 1, duration: 1, ease: 'expo.inOut' }, '-=0.7')
      .fromTo(q('.ld-sub'), { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: 'power2.out' }, '-=0.5')
      .to(chars, { yPercent: -120, duration: 0.75, ease: 'expo.in', stagger: 0.04 }, '+=0.6')
      .to(q('.ld-rule'), { scaleX: 0, transformOrigin: 'right', duration: 0.7, ease: 'expo.in' }, '<0.1')
      .to(q('.ld-sub'), { autoAlpha: 0, duration: 0.3 }, '<0.2')
      .to(q('.ct-top'), { yPercent: -100, duration: 1.3, ease: 'expo.inOut' }, '-=0.05')
      .to(q('.ct-bot'), { yPercent: 100, duration: 1.3, ease: 'expo.inOut' }, '<')
      .fromTo(q('.hero-inner'), { scale: 1.12 }, { scale: 1, duration: 2, ease: 'expo.out' }, '<0.25')
      .add(heroIn(q), '<0.3');
  },

  c(q) {
    const hero = q('.hero');
    return gsap
      .timeline()
      .set(q('.hero-inner'), { scale: 1.3 })
      .to(q('.ld-corner'), { autoAlpha: 1, duration: 0.6, stagger: 0.08 }, 0.15)
      .to(q('.ld-tag'), { autoAlpha: 1, duration: 0.6, stagger: 0.1 }, '<0.2')
      .to(q('.ld-line'), { scaleX: 1, duration: 1.2, ease: 'expo.inOut' }, 0.5)
      .set(hero, { clipPath: 'inset(50% 15% 50% 15%)' })
      .to(hero, { clipPath: 'inset(24% 15% 24% 15%)', duration: 1.1, ease: 'expo.inOut' }, '+=0.15')
      .to(q('.ld-line'), { autoAlpha: 0, duration: 0.5 }, '<0.15')
      .to(q('.hero-inner'), { scale: 1.18, duration: 1.1, ease: 'expo.inOut' }, '<-0.15')
      // the title rises inside the aperture, so the window has something to frame
      .add(heroIn(q), '<0.5')
      .to(hero, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, '<1.1')
      .to(q('.hero-inner'), { scale: 1, duration: 1.8, ease: 'expo.inOut' }, '<')
      .to(q('.ld-corner, .ld-tag'), { autoAlpha: 0, duration: 0.5 }, '<0.2');
  },
};

function mount(article) {
  const v = article.dataset.variant;
  const slot = article.querySelector('.stage-slot');
  let tl;

  const play = () => {
    tl?.kill();
    slot.replaceChildren(document.getElementById('stage-tpl').content.cloneNode(true));
    const stage = slot.querySelector('.stage');
    stage.dataset.v = v;
    stage.addEventListener('click', () => stage.classList.remove('is-full'));
    stage.querySelector('.loader').outerHTML = loaders[v];
    const q = gsap.utils.selector(stage);
    // Hidden start states live here, not in CSS: GSAP reads a CSS translate as px and would stack it under yPercent.
    gsap.set(q('.li'), { yPercent: 110 });
    gsap.set(q('.ld-name span'), { yPercent: 120 });
    if (reduced) {
      q('.loader')[0].remove();
      gsap.set(q('.hero'), { clipPath: 'none' });
      heroIn(q).progress(1);
      return stage;
    }
    tl = timelines[v](q);
    return stage;
  };

  let stage = null;
  const io = new IntersectionObserver(
    ([e]) => {
      if (e.isIntersecting) {
        stage = play();
        io.disconnect();
      }
    },
    { threshold: 0.5 },
  );
  io.observe(slot);

  article.addEventListener('click', (e) => {
    const act = e.target.closest('[data-act]')?.dataset.act;
    if (!act) return;
    io.disconnect();
    const wasFull = stage?.classList.contains('is-full');
    stage = play();
    if (act === 'full' || wasFull) stage.classList.add('is-full');
  });
}

document.querySelectorAll('.variant').forEach(mount);

addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.querySelector('.stage.is-full')?.classList.remove('is-full');
});
