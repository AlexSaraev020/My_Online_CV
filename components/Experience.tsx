'use client';

/* ==========================================================================
   The director: the scroll choreography.

   It is one effect over the server-rendered plates rather than a tree of React
   state, because the values it produces change every frame — a re-render per
   frame would cost more than the animation is worth. It adds classes, sets
   custom properties, and hands the scroll / pointer numbers to the 3D field.

   Everything it does is additive: with scripting off the content is simply
   visible, and with prefers-reduced-motion on it does none of it.
   ========================================================================== */

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import { fieldApi } from '@/lib/field/state';

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const every = (sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<HTMLElement>(sel));

/* 0 when an element's top edge enters the viewport, 1 when it has left it */
function pass(el: Element): number {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  return clamp01((vh - r.top) / (vh + r.height));
}

const GLYPHS = '0123456789/<>[]{}#*·';

export default function Experience({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.js = 'on';

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const cleanups: Array<() => void> = [];
    const on = (target: EventTarget, type: string, handler: EventListener, opts?: AddEventListenerOptions) => {
      target.addEventListener(type, handler as EventListenerOrEventListenerObject, opts);
      cleanups.push(() => target.removeEventListener(type, handler as EventListenerOrEventListenerObject, opts));
    };

    const announce = (msg: string) => {
      const live = document.getElementById('live');
      if (live) live.textContent = msg;
    };

    /* ------------------------------------------- plate numerals decode -- */
    function decode(el: HTMLElement) {
      if (reduce || el.dataset.decoded) return;
      el.dataset.decoded = '1';
      const final = el.textContent || '';
      let step = 0;
      const id = window.setInterval(() => {
        step++;
        if (step > final.length + 2) { window.clearInterval(id); el.textContent = final; return; }
        el.textContent = final.split('').map((ch, i) => (i < step - 2 ? ch : GLYPHS.charAt((Math.random() * GLYPHS.length) | 0))).join('');
      }, 70);
      cleanups.push(() => window.clearInterval(id));
    }

    /* ------------------------------------------------- reveals + sweep -- */
    const hero = document.getElementById('hero');
    const intro = document.getElementById('intro');

    const revealTargets = reduce
      ? []
      : every('[data-reveal], [data-words], .stagger > *, [data-decode]').filter((el) => !(hero && el.closest('#hero')));

    const pending = new Set(revealTargets);
    function sweepReveals() {
      if (!pending.size) return;
      for (const el of pending) {
        if (el.getBoundingClientRect().bottom < 0) {
          el.classList.add('in');
          pending.delete(el);
        }
      }
    }

    let io: IntersectionObserver | null = null;
    if (revealTargets.length && 'IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('in');
          if (entry.target.hasAttribute('data-decode')) decode(entry.target as HTMLElement);
          pending.delete(entry.target as HTMLElement);
          io?.unobserve(entry.target);
        }
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
      revealTargets.forEach((el) => io!.observe(el));
      cleanups.push(() => io?.disconnect());
    } else {
      revealTargets.forEach((el) => el.classList.add('in'));
    }

    /* ------------------------------------------------ opening sequence -- */
    function revealHero() {
      if (!hero) return;
      hero.classList.add('is-live');
      every('#hero [data-words], #hero .stagger > *', hero).forEach((el) => el.classList.add('in'));
      every('#hero [data-decode]', hero).forEach((el) => { el.classList.add('in'); decode(el as HTMLElement); });
    }

    function armIntro() {
      if (reduce || !hero) { revealHero(); return; }
      root.dataset.stage = 'intro';
      const timers: number[] = [];
      const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
      cleanups.push(() => timers.forEach(clearTimeout));

      at(560, revealHero);
      at(1500, () => {
        intro?.classList.add('is-done');
        delete root.dataset.stage;
      });

      /* anything the visitor does takes the sequence away immediately */
      const skip = () => {
        timers.forEach(clearTimeout);
        revealHero();
        intro?.classList.add('is-done');
        delete root.dataset.stage;
        detach();
      };
      const detach = () => types.forEach(([t, h, o]) => window.removeEventListener(t, h, o));
      const types: Array<[string, EventListener, AddEventListenerOptions]> =
        ['wheel', 'pointerdown', 'keydown', 'touchstart'].map((t) => [t, skip as EventListener, { passive: true }]);
      types.forEach(([t, h, o]) => window.addEventListener(t, h, o));
      cleanups.push(detach);
    }

    /* ------------------------------------------------- smooth scrolling -- */
    let lenis: Lenis | null = null;
    if (!reduce) {
      try {
        lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
        root.style.scrollBehavior = 'auto';
        let raf = 0;
        const tick = (time: number) => { lenis?.raf(time); raf = requestAnimationFrame(tick); };
        raf = requestAnimationFrame(tick);
        cleanups.push(() => { cancelAnimationFrame(raf); lenis?.destroy(); lenis = null; });
      } catch {
        lenis = null;
      }
    }

    function scrollToId(id: string) {
      const target = document.getElementById(id);
      if (!target) return;
      if (lenis) { lenis.scrollTo(target, { offset: -72 }); return; }
      target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }

    /* nav clicks scroll in place on the plate page; elsewhere they navigate */
    on(document, 'click', (ev) => {
      const e = ev as MouseEvent;
      const nav = (e.target as HTMLElement).closest?.('[data-nav]') as HTMLElement | null;
      if (!nav) return;
      const id = nav.dataset.nav;
      if (!id) return;
      const sheet = document.getElementById('menuSheet') as HTMLDialogElement | null;
      if (sheet?.open) sheet.close();
      /* on the plate page a plate is a scroll; from a case page it is a link */
      if (window.location.pathname.replace(/\/$/, '') === '') {
        e.preventDefault();
        scrollToId(id);
      }
    });

    /* ------------------------------------------------------- rail marks -- */
    const rail = document.getElementById('rail');
    const railMarks: HTMLElement[] = [];
    const marksList = document.getElementById('railMarks');
    if (rail && marksList) {
      const doc = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      every('main section[id]').forEach((s) => {
        const li = document.createElement('li');
        li.style.top = `${((s.offsetTop / doc) * 100).toFixed(2)}%`;
        li.dataset.id = s.id;
        marksList.appendChild(li);
        railMarks.push(li);
      });
    }

    const processPath = document.getElementById('processPath') as SVGPathElement | null;
    const processSection = document.getElementById('process');
    let pathLen = 0;
    if (processPath && typeof processPath.getTotalLength === 'function') {
      pathLen = processPath.getTotalLength();
      processPath.style.strokeDasharray = `${pathLen} ${pathLen}`;
      processPath.style.strokeDashoffset = reduce ? '0' : String(pathLen);
    }

    const parallax = every('[data-parallax]');
    const sections = every('main section[id]');
    const navLinks = every('#navList a');
    const navEl = document.querySelector<HTMLElement>('.nav');
    const navIndicator = document.querySelector<HTMLElement>('.nav-indicator');
    const bar = document.getElementById('scrollBar');
    const railFill = document.getElementById('railFill');
    const railState = document.getElementById('railState');
    let activeId = '';
    let railText = '';

    function setNavActive(id: string) {
      if (id === activeId) return;
      activeId = id;
      /* one section changing hands is worth one sweep of light through the field */
      fieldApi.wipe();
      const active = navLinks.find((a) => a.dataset.nav === id);
      navLinks.forEach((a) => {
        if (a === active) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
      if (active && navEl && navIndicator) {
        navEl.classList.add('is-live');
        navIndicator.style.setProperty('--nav-x', `${active.offsetLeft}px`);
        navIndicator.style.setProperty('--nav-w', `${active.offsetWidth}px`);
      }
    }

    /* ---------------------------------------- one loop for all scrubbing -- */
    function tickScroll() {
      sweepReveals();
      const y = window.scrollY || 0;
      const vh = window.innerHeight || 1;
      const max = Math.max(1, document.documentElement.scrollHeight - vh);
      const p = clamp01(y / max);

      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
      fieldApi.setProgress(p);

      /* the field steps back through the reading sections and comes forward
         again at both ends of the journey */
      const reading = clamp01((p - 0.16) / 0.14) * clamp01((0.84 - p) / 0.14);
      fieldApi.setDim(1 - 0.62 * reading);

      sections.forEach((s) => {
        const head = s.querySelector('.sec-head') || s;
        s.style.setProperty('--tp', clamp01(pass(head) * 1.6 - 0.18).toFixed(3));
      });

      if (rail) {
        if (railFill) railFill.style.transform = `scaleY(${p.toFixed(4)})`;
        railMarks.forEach((mk) => {
          const sec = document.getElementById(mk.dataset.id || '');
          if (sec && sec.offsetTop <= y + 120) mk.classList.add('is-past');
          else mk.classList.remove('is-past');
        });
        const state = p < 0.3 ? 'Field' : p < 0.72 ? 'Commit' : 'Deliver';
        if (state !== railText) {
          railText = state;
          if (railState) railState.textContent = state;
        }
      }

      if (processSection && processPath && !reduce) {
        processPath.style.strokeDashoffset = String((pathLen * (1 - pass(processSection))).toFixed(1));
      }

      if (!reduce) {
        parallax.forEach((el) => {
          const amount = Number.parseFloat(el.getAttribute('data-parallax') || '0.05') || 0.05;
          const own = pass(el) - 0.5;
          el.style.transform = `translate3d(0, ${(own * amount * -240).toFixed(1)}px, 0)`;
        });
      }

      const anchor = y + (Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue('--bar-h'), 10) || 64) + 40;
      let current = sections[0] ? sections[0].id : '';
      sections.forEach((s) => { if (s.offsetTop <= anchor) current = s.id; });
      if (current) setNavActive(current);
    }

    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; tickScroll(); });
    };
    on(window, 'scroll', onScroll, { passive: true });
    on(window, 'resize', onScroll);

    /* ------------------------------------------------------ cursor & field */
    const cursor = document.getElementById('cursor');
    if (cursor && fine && !reduce) {
      let cx = 0, cy = 0, tx = 0, ty = 0, raf = 0;
      const follow = () => {
        cx += (tx - cx) * 0.18;
        cy += (ty - cy) * 0.18;
        /* the wrapper carries the position so the ring keeps its own scale states */
        cursor.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
        raf = requestAnimationFrame(follow);
      };
      raf = requestAnimationFrame(follow);
      cleanups.push(() => cancelAnimationFrame(raf));

      const interactive = 'a, button, input, select, textarea';
      on(document, 'pointermove', (ev) => { tx = (ev as PointerEvent).clientX; ty = (ev as PointerEvent).clientY; }, { passive: true });
      on(document, 'pointerover', (ev) => { if ((ev.target as HTMLElement).closest?.(interactive)) cursor.classList.add('is-hot'); });
      on(document, 'pointerout', (ev) => { if ((ev.target as HTMLElement).closest?.(interactive)) cursor.classList.remove('is-hot'); });
    }

    if (fine && !reduce) {
      every('.magnetic').forEach((el) => {
        const move = (ev: Event) => {
          const e = ev as PointerEvent;
          const r = el.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
          const dy = (e.clientY - (r.top + r.height / 2)) * 0.30;
          el.style.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
        };
        const leave = () => { el.style.transform = ''; };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
        cleanups.push(() => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); });
      });
    }

    if (fine && !reduce) {
      on(document, 'pointermove', (ev) => {
        const e = ev as PointerEvent;
        fieldApi.setPointer(
          (e.clientX / (window.innerWidth || 1)) * 2 - 1,
          (e.clientY / (window.innerHeight || 1)) * 2 - 1
        );
      }, { passive: true });
    }

    armIntro();
    tickScroll();

    /* a shared link to a plate or a card must land on it, whatever the browser
       decided to do with the fragment during navigation */
    const wanted = decodeURIComponent((window.location.hash || '').replace(/^#/, ''));
    if (wanted && document.getElementById(wanted)) {
      const t = window.setTimeout(() => scrollToId(wanted), 80);
      cleanups.push(() => window.clearTimeout(t));
    }
    /* the field may mount after this effect (it probes WebGL first) */
    const fieldTimer = window.setTimeout(tickScroll, 400);
    cleanups.push(() => window.clearTimeout(fieldTimer));

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return <>{children}</>;
}
