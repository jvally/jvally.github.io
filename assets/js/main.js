(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Mobile menu --- */
  function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    const setOpen = (open) => {
      menu.classList.toggle('hidden', !open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setOpen(menu.classList.contains('hidden')));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  /* --- Smooth scrolling for in-page links --- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const id = link.getAttribute('href').slice(1);
        const target = id && document.getElementById(id); // getElementById: no selector injection
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', '#' + id);
      });
    });
  }

  /* --- Highlight the nav link of the section in view --- */
  function initActiveNav() {
    const links = document.querySelectorAll('.nav-link[href^="#"]');
    const sections = document.querySelectorAll('main section[id]');
    if (!('IntersectionObserver' in window) || !sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((s) => observer.observe(s));
  }

  /* --- Footer year --- */
  function initYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* --- Unlock game ---------------------------------------------------------
     Every element with a data-unlock attribute is one step, in page order.
     Entering that attribute's value in the terminal reveals the element.
     Visitor input is only ever compared as a string and echoed with
     textContent; it is never evaluated or inserted as HTML. */
  function initGame() {
    const root = document.documentElement;
    const output = document.getElementById('term-output');
    const input = document.getElementById('term-input');
    const runBtn = document.getElementById('term-run');
    const progress = document.getElementById('term-progress');
    if (!root.classList.contains('game') || !output || !input) return;

    const STORE_COUNT = 'vj:unlocked';
    const STORE_DONE = 'vj:done';
    const norm = (v) => v.trim().replace(/\s+/g, ' ').replace(/\/$/, '').toLowerCase();
    const el = (tag, className, text) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    };
    const chip = (cmd) => {
      const b = el('button', 'cmd-chip', cmd);
      b.type = 'button';
      b.dataset.run = cmd;
      return b;
    };
    const store = {
      get(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } },
      set(key, value) { try { window.localStorage.setItem(key, value); } catch (e) { /* ignore */ } },
    };

    const steps = Array.from(document.querySelectorAll('[data-unlock]')).map((node) => {
      const answer = node.dataset.unlock.trim();
      const isFlag = /^flag\{/i.test(answer);
      const isSection = node.tagName === 'SECTION';

      // Lock panel shown in place of the element's content while it is locked
      const panel = el('div', 'lock-panel' + (isSection ? ' lock-panel--section container-page' : ''));
      const box = el('div', 'lock-box');
      const hint = el('p', 'lock-hint');
      box.append(
        el('p', 'lock-tag', '[ LOCKED ]'),
        el('p', 'lock-title', isFlag ? 'project encrypted' : 'permission denied'),
        hint
      );
      panel.append(box);
      node.append(panel);

      // A flag is "found" at the bottom of the element just before the one it unlocks
      let drop = null;
      const carrier = node.previousElementSibling;
      if (isFlag && carrier) {
        drop = el('p', 'flag-drop');
        drop.append(el('span', '', 'flag found:'), chip(answer));
        carrier.append(drop);
      }
      return { node, answer, key: norm(answer), isFlag, hint, drop };
    });
    if (!steps.length) return;

    let unlocked = Math.min(parseInt(store.get(STORE_COUNT), 10) || 0, steps.length);
    if (store.get(STORE_DONE) === '1') unlocked = steps.length;

    const nextHint = () => {
      const next = steps[unlocked];
      if (!next) return ['everything is unlocked.'];
      return next.isFlag
        ? ['next: submit the flag shown at the bottom of the last project.']
        : ['next: run ', chip(next.answer)];
    };

    function print(echo, parts) {
      output.replaceChildren();
      if (echo) output.append(el('span', 'term-echo', '$ ' + echo));
      const reply = el('span', 'term-reply');
      reply.append(...parts);
      output.append(reply);
    }

    function render() {
      const done = unlocked >= steps.length;
      steps.forEach((step, i) => {
        step.node.classList.toggle('is-unlocked', i < unlocked);
        if (step.drop) step.drop.classList.toggle('is-used', i < unlocked);
        if (i < unlocked) return;
        if (i > unlocked) {
          step.hint.replaceChildren('unlock the previous step first.');
        } else if (step.isFlag) {
          step.hint.replaceChildren('submit the flag from the previous project to decrypt it.');
        } else {
          step.hint.replaceChildren('run ', chip(step.answer), ' to unlock this section.');
        }
      });
      root.classList.toggle('game-done', done);
      progress.textContent = unlocked + '/' + steps.length;
      store.set(STORE_COUNT, String(unlocked));
      store.set(STORE_DONE, done ? '1' : '0');
    }

    function reveal(step) {
      step.node.classList.add('just-unlocked');
      step.node.addEventListener('animationend', () => step.node.classList.remove('just-unlocked'), { once: true });
      step.node.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: step.isFlag ? 'center' : 'start' });
    }

    function run(raw) {
      const typed = raw.trim().replace(/\s+/g, ' ').slice(0, 80);
      if (!typed) return;
      const command = typed.toLowerCase();
      const index = steps.findIndex((s) => s.key === norm(typed.replace(/^submit /i, '')));

      if (index !== -1 && index < unlocked) {
        print(typed, ['already unlocked. ', ...nextHint()]);
        steps[index].node.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      } else if (index === unlocked) {
        unlocked += 1;
        render();
        reveal(steps[index]);
        print(typed, unlocked >= steps.length
          ? ['root@vishesh:~# access granted. everything is unlocked.']
          : ['access granted (' + unlocked + '/' + steps.length + '). ', ...nextHint()]);
      } else if (index > unlocked) {
        print(typed, ['permission denied: not yet. ', ...nextHint()]);
      } else if (command === 'help') {
        print(typed, ['commands: help, hint, ls, whoami, clear, reset, sudo unlock --all']);
      } else if (command === 'hint' || command === 'ls') {
        print(typed, [unlocked + '/' + steps.length + ' unlocked. ', ...nextHint()]);
      } else if (command === 'whoami') {
        print(typed, [unlocked >= steps.length ? 'root' : 'visitor (unlock everything to become root)']);
      } else if (command === 'clear') {
        output.replaceChildren();
      } else if (command === 'reset') {
        unlocked = 0;
        render();
        print(typed, ['locked everything again. ', ...nextHint()]);
        window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
      } else if (command === 'sudo unlock --all' || command === 'skip') {
        unlocked = steps.length;
        render();
        print(typed, ['root@vishesh:~# game skipped. everything is unlocked.']);
      } else if (/^sudo rm\b/.test(command)) {
        print(typed, ['nice try.']);
      } else {
        print(typed, ['command not found: ' + typed.split(' ')[0].slice(0, 30) + '. try help']);
      }
    }

    const submit = () => { run(input.value); input.value = ''; };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
    if (runBtn) runBtn.addEventListener('click', submit);
    // Any element with data-run (chips, skip, replay) runs its command when clicked
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-run]');
      if (trigger) run(trigger.dataset.run);
    });

    render();
    print('', unlocked >= steps.length
      ? ['root@vishesh:~# everything is unlocked.']
      : unlocked > 0
        ? ['welcome back. ' + unlocked + '/' + steps.length + ' unlocked. ', ...nextHint()]
        : ['mini CTF: unlock each section. ', ...nextHint()]);
  }

  initMobileMenu();
  initSmoothScroll();
  initActiveNav();
  initYear();
  initGame();
})();
