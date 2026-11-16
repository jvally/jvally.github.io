(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const root = document.documentElement;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollTo = (node, block = 'start') => node.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block });
  // Text is always set with textContent, never as HTML
  const make = (tag, className, text = '') => Object.assign(document.createElement(tag), { className, textContent: text });

  /* ---------- Navigation ---------- */
  const nav = $('#nav');
  const toggle = $('#menu-toggle');
  const setMenu = (open) => {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', (e) => e.target.closest('a') && setMenu(false));
  addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));

  // Highlight the link of the section in view
  const links = $$('a', nav);
  const spy = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) links.forEach((a) => a.classList.toggle('active', a.hash === '#' + entry.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach((section) => spy.observe(section));

  $('#year').textContent = new Date().getFullYear();

  /* ---------- Motion ---------- */
  // Sections fade up as they enter the viewport
  const reveal = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('in');
    reveal.unobserve(entry.target);
  }), { threshold: 0.05 });
  $$('.reveal').forEach((node) => reveal.observe(node));

  // The paper plane loops when clicked and whenever a step unlocks
  const plane = $('#plane');
  const planeBody = $('.plane-body', plane);
  const loop = () => planeBody.classList.add('loop');
  planeBody.addEventListener('animationend', () => planeBody.classList.remove('loop'));
  plane.addEventListener('click', loop);

  // Clouds drift with scroll and pointer; the plane turns to face the pointer
  if (!calm) {
    let pointer = null;
    let heading = 55;
    let queued = false;
    const paint = () => {
      queued = false;
      const range = root.scrollHeight - innerHeight;
      root.style.setProperty('--sp', range > 0 ? scrollY / range : 0);
      if (!pointer) return;
      root.style.setProperty('--px', pointer.clientX / innerWidth - 0.5);
      root.style.setProperty('--py', pointer.clientY / innerHeight - 0.5);
      const box = plane.ownerSVGElement.getBoundingClientRect();
      const target = Math.atan2(pointer.clientY - (box.top + box.height / 2), pointer.clientX - (box.left + box.width / 2)) * 180 / Math.PI + 90;
      heading += ((target - heading) % 360 + 540) % 360 - 180; // turn the short way round
      plane.style.rotate = heading + 'deg';
    };
    const queue = () => {
      if (!queued) queued = requestAnimationFrame(paint);
    };
    addEventListener('scroll', queue, { passive: true });
    addEventListener('pointermove', (e) => { pointer = e; queue(); }, { passive: true });
    paint();
  }

  /* ---------- Unlock game ----------
     Every [data-unlock] element is one step, in page order; entering its value reveals it.
     Visitor input is only compared as a string and echoed as text. */
  const output = $('#term-output');
  const input = $('#term-input');
  const norm = (value) => value.trim().replace(/\s+/g, ' ').replace(/\/$/, '').toLowerCase();
  const chip = (command, className = 'cmd-chip', label = command) => {
    const button = make('button', className, label);
    button.type = 'button';
    button.dataset.run = command;
    return button;
  };
  const store = (key, value) => {
    try {
      return value === undefined ? localStorage.getItem(key) : localStorage.setItem(key, value);
    } catch (e) {
      return null;
    }
  };

  const steps = $$('[data-unlock]').map((node) => {
    const answer = node.dataset.unlock.trim();
    const isFlag = answer.startsWith('flag{');
    const panel = node.appendChild(make('div', 'lock-panel'));
    // A flag is "found" at the bottom of the card before the one it unlocks
    let drop = null;
    if (isFlag && node.previousElementSibling) {
      drop = node.previousElementSibling.appendChild(make('p', 'flag-drop', 'flag found:'));
      drop.append(chip(answer));
    }
    return { node, answer, key: norm(answer), isFlag, panel, drop, section: isFlag ? null : node.closest('section') };
  });
  const total = steps.length;
  let unlocked = store('vj:done') === '1' ? total : Math.min(Number(store('vj:unlocked')) || 0, total);
  const done = () => unlocked >= total;

  const next = () => {
    if (done()) return ['everything is unlocked.'];
    const step = steps[unlocked];
    return step.isFlag ? ['next: submit the flag at the bottom of the last project.'] : ['next: run ', chip(step.answer)];
  };
  const print = (echo, ...parts) => {
    const reply = make('span', 'block');
    reply.append(...parts);
    output.replaceChildren(...(echo ? [make('span', 'term-echo', '$ ' + echo)] : []), reply);
  };

  function render() {
    steps.forEach((step, i) => {
      const open = i < unlocked;
      const isNext = i === unlocked;
      step.node.classList.toggle('is-unlocked', open);
      if (step.drop) step.drop.classList.toggle('is-used', open);
      if (step.section) {
        step.section.classList.toggle('is-locked', !open);
        step.section.classList.toggle('is-next', isNext);
      }
      if (open) step.panel.replaceChildren();
      else if (step.isFlag) step.panel.replaceChildren(make('p', 'lock-title', 'encrypted'), isNext ? 'Submit the flag from the project above.' : '');
      else step.panel.replaceChildren(...(isNext ? [chip(step.answer, 'run-btn', 'run ↵'), make('span', 'run-note', 'or type it in the terminal below')] : []));
    });
    root.classList.toggle('done', done());
    // The dial has one segment per step
    const arc = 80 / total;
    $('#dial-progress').setAttribute('stroke-dasharray', `${(arc - 1 + ' 1 ').repeat(unlocked)}0 80`);
    store('vj:unlocked', unlocked);
    store('vj:done', done() ? '1' : '0');
  }

  const commands = new Map([
    ['help', () => ['commands: help, hint, whoami, reset, skip. Tab completes what you type.']],
    ['hint', () => [unlocked + '/' + total + ' unlocked. ', ...next()]],
    ['whoami', () => [done() ? 'root' : 'visitor (unlock everything to become root)']],
    ['reset', () => { unlocked = 0; render(); scrollTo(document.body); return ['locked everything again. ', ...next()]; }],
    ['skip', () => { unlocked = total; render(); return ['skipped. everything is unlocked.']; }],
  ]);

  function run(raw) {
    const typed = raw.trim().replace(/\s+/g, ' ').slice(0, 80);
    if (!typed) return;
    const index = steps.findIndex((step) => step.key === norm(typed.replace(/^submit /i, '')));
    const step = steps[index];
    const command = commands.get(typed.toLowerCase().replace('sudo unlock --all', 'skip'));

    if (index === unlocked) {
      unlocked += 1;
      render();
      step.node.classList.add('just-unlocked');
      step.node.addEventListener('animationend', () => step.node.classList.remove('just-unlocked'), { once: true });
      scrollTo(step.section || step.node, step.isFlag ? 'center' : 'start');
      loop();
      print(typed, done() ? 'access granted. everything is unlocked.' : `access granted (${unlocked}/${total}). `, ...(done() ? [] : next()));
    } else if (index > unlocked) {
      print(typed, 'permission denied: not yet. ', ...next());
    } else if (step) {
      scrollTo(step.section || step.node, step.isFlag ? 'center' : 'start');
      print(typed, 'already unlocked. ', ...next());
    } else {
      print(typed, ...(command ? command() : [`command not found: ${typed.split(' ')[0].slice(0, 30)}. try help`]));
    }
  }

  // Completion: the ghost behind the input shows the first match; Tab or Right Arrow accepts it.
  // Flags are only offered once the card showing them is unlocked.
  const ghost = $('#term-ghost');
  const suggestion = () => {
    const typed = input.value.toLowerCase();
    const options = [steps[unlocked], ...steps.filter((step, i) => !step.isFlag || i <= unlocked)]
      .filter(Boolean).map((step) => step.answer).concat([...commands.keys()]);
    return typed && options.find((option) => option.toLowerCase().startsWith(typed) && option.length > typed.length);
  };
  const suggest = () => {
    const match = suggestion();
    ghost.replaceChildren(...(match ? [make('span', '', input.value), match.slice(input.value.length)] : []));
  };
  const submit = () => { run(input.value); input.value = ''; suggest(); };
  input.addEventListener('input', suggest);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') return submit();
    const atEnd = input.selectionStart === input.value.length;
    const match = (e.key === 'Tab' || (e.key === 'ArrowRight' && atEnd)) && suggestion();
    if (!match) return; // nothing to complete: Tab moves focus as usual
    e.preventDefault();
    input.value = match;
    suggest();
  });
  $('#term-run').addEventListener('click', submit);
  // Chips, run buttons, skip and replay all carry the command they run in data-run
  addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-run]');
    if (trigger) run(trigger.dataset.run);
  });

  /* ---------- Project preview ----------
     Clicking an unlocked card opens a small window that plays the card's .demo steps one by one. */
  const preview = $('#preview');
  const stepList = $('#preview-steps');
  const shot = $('#preview-shot');
  let demo = [];
  let timer = 0;
  const play = () => {
    clearTimeout(timer);
    stepList.replaceChildren();
    const queue = demo.map((line) => line.cloneNode(true));
    const tick = () => {
      if (!queue.length) return;
      stepList.append(queue.shift());
      timer = setTimeout(tick, calm ? 0 : 650);
    };
    tick();
  };
  $('#projects').addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    const locked = card && card.dataset.unlock && !card.classList.contains('is-unlocked') && !done();
    if (!card || locked || e.target.closest('a, [data-run]')) return;
    demo = $$('.demo > li', card);
    if (!demo.length) return;
    $('#preview-title').textContent = $('.card-title', card).textContent;
    shot.hidden = !card.dataset.shot;
    if (card.dataset.shot) shot.src = card.dataset.shot;
    preview.showModal();
    play();
  });
  $('#preview-replay').addEventListener('click', play);
  // Close on the close button or a click on the backdrop; Escape is handled by <dialog>
  preview.addEventListener('click', (e) => (e.target === preview || e.target.closest('[data-close]')) && preview.close());
  preview.addEventListener('close', () => clearTimeout(timer));

  render();
  print('', done() ? 'everything is unlocked.' : unlocked ? `welcome back. ${unlocked}/${total} unlocked. ` : 'run each command to print its section. ', ...(done() ? [] : next()));
})();
