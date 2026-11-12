# DESIGN.md — Vishesh Jally portfolio

Design reference for `index.html`. Read this before changing styles; update it when a token or component changes.

## Direction

A modern terminal, not a retro one. Dark canvas, one green accent, monospace headings over a clean sans body. The security/developer flavour comes from shell-prompt details (`$ whoami`, `$ ls projects/`), not from decoration.

- Stack: HTML5, Tailwind CSS 3 (compiled with the Tailwind CLI), vanilla JavaScript.
- Files: `index.html` (markup), `src/input.css` (tokens and component classes), `tailwind.config.js` (token-to-utility mapping), `assets/js/main.js` (behaviour). `assets/css/styles.css` is build output; never edit it.
- Dark only. No light theme yet.

## Colour tokens

Defined once as space-separated RGB triplets in the `:root` block of `src/input.css`, mapped to Tailwind colour names in `tailwind.config.js`. Change a value in `:root` and every utility follows (`bg-surface`, `text-accent/60`, ...).

| Token | Tailwind name | Value | Role |
| --- | --- | --- | --- |
| `--color-bg` | `bg` | `#0a0e14` | Page canvas, mobile menu |
| `--color-surface` | `surface` | `#111720` | Cards |
| `--color-border` | `border` | `#232d3c` | Hairlines, card and tag outlines |
| `--color-text` | `text` | `#c9d1d9` | Body text |
| `--color-muted` | `muted` | `#7d8a99` | Secondary text, inactive nav links |
| `--color-heading` | `heading` | `#f0f6fc` | Headings, ghost-button labels |
| `--color-accent` | `accent` | `#39ff88` | Prompts, links, tags, focus ring, primary button, hover glow |

The palette is closed: canvas, surface, border, three text tones, one accent.

## Typography

| Use | Family | Notes |
| --- | --- | --- |
| Headings, nav, buttons, tags, eyebrows | JetBrains Mono (`font-mono`) | Weights 400 / 500 / 700 |
| Body copy | Inter (`font-sans`) | Weights 400 / 500 / 600, `leading-relaxed` |

- Hero name: `text-4xl`, `sm:text-6xl`, bold.
- Section headings: `text-2xl`, `sm:text-3xl`, bold.
- Card titles: `text-lg`, bold. Card body: `text-sm` in `muted`.
- Eyebrows and tags: `text-sm` / `text-xs` mono in `accent`.

## Layout

- Content width: `max-w-5xl`, side padding `px-4` (`sm:px-6`) via `.container-page`.
- Sections: `py-20` (`sm:py-24`), separated by a top hairline, never by background changes.
- Fixed header is `4rem` tall (`--header-height`); sections use it as `scroll-margin-top`.
- Hero fills the viewport height and is left-aligned.
- Breakpoints: projects grid is 1 column, 2 from `sm`; the featured first card spans both columns. About grid is 1 column, 3 from `md` (environment card spans 2). Nav collapses to a hamburger menu below `md`.

## Shell-prompt conventions

- Section headings are commands. `.section-title` adds a green `$ ` prefix; the visible command sits in an `aria-hidden` span and the plain section name in an `sr-only` span, so screen readers hear "About", not "cat about dot m d".
- Commands in use: `cat about.md`, `ls projects/`, `cat experience.log`, `./contact.sh`. The hero eyebrow is `$ whoami`.
- Brand mark is `~/vishesh` with the `~/` in accent.
- The hero name ends in a pulsing `_` cursor. It is the only decorative animation.
- Nav links keep plain labels (About, Projects, ...) for clarity.

```html
<h2 class="section-title">
  <span aria-hidden="true">cat skills.txt</span><span class="sr-only">Skills</span>
</h2>
```

## Components

All shared styling lives in the `@layer components` block of `src/input.css`. Edit there, not on individual elements, then rebuild (`npm run dev` watches for changes).

| Class | Purpose |
| --- | --- |
| `.container-page` | Centred content column |
| `.section`, `.section-title` | Section spacing and shell-prompt heading |
| `.nav-link`, `.nav-link.active` | Mono nav links; `active` is set by the scroll observer |
| `.btn-primary` | Solid accent button; lifts and glows on hover |
| `.btn-ghost` | Bordered button; border and text turn accent on hover |
| `.card` | Bordered surface panel, flex column |
| `.card-hover` | Adds the lift (`-translate-y-1`), accent border and `shadow-glow` on hover. Projects only |
| `.card-title`, `.card-body` | Card text styles |
| `.card-list` | Bullet list inside a card or timeline entry, with a green `>` marker |
| `.card-link` | Small mono link to a repo or write-up, placed before the tag list |
| `.timeline`, `.timeline-item` | Experience list with a left rule and accent dot per entry |
| `.tag-list`, `.tag` | Chip row pinned to the bottom of a card |
| `.eyebrow` | Small accent mono label |
| `.link` | Inline accent link |

Adding a project: copy an `<article class="card card-hover">` block in the projects grid and change the eyebrow (number and dates), title, text and tags. Add `sm:col-span-2` to feature it at full width.

Adding an experience entry: copy a `<li class="timeline-item">` block. The eyebrow reads `Kind · dates`.

## Motion

- Hover transitions: 200ms on buttons, 300ms on cards.
- Smooth scrolling for in-page links.
- `prefers-reduced-motion: reduce` disables all transitions, animations and smooth scrolling.

## Accessibility

- Skip-to-content link is the first focusable element.
- Visible focus ring: 2px accent outline on `:focus-visible`.
- Mobile menu button keeps `aria-expanded` in sync and closes on Escape.
- Body text on canvas and muted text on surface both need to stay at or above WCAG AA (4.5:1) if tokens change.

## Security rules

- External links always carry `target="_blank" rel="noopener noreferrer"`.
- Never insert content with `innerHTML`; use `textContent`. No `eval`.
- No inline `<script>`, `<style>`, `style=""` or `onclick=""` attributes: the CSP allows scripts and styles from files only, so inline code is blocked.
- The CSP meta tag in `<head>` lists every allowed origin. A new CDN, font host or image host must be added there or it will be blocked.
- GitHub Actions in `.github/workflows/deploy.yml` are pinned to commit SHAs; update the SHA and the version comment together.
- Known gap: `frame-ancestors` (clickjacking protection) cannot be set from a meta tag, and GitHub Pages does not allow custom response headers.
- The contact email is published in plain text and will be harvested by scrapers.

## Do

- Use token-backed utilities (`text-accent`, `border-border`) and the component classes.
- Keep accent for prompts, links, tags, focus and the single primary action per section.
- Write new section headings as shell commands with an `sr-only` plain name.
- Check the page at 390px wide after any layout change.

## Don't

- Hard-code hex colours in markup.
- Add a second accent colour or per-section background tints.
- Add CRT effects: scanlines, heavy text glow, all-caps headings.
- Put the hover glow on anything except project cards and the primary button.
- Hide information behind hover states.

## Open items

- Only the CTF card links to a repository. Paranoid Planner, the Juice Shop write-up, TripShield and the HTTP server have `TODO` comments where their links go.
- Fonts load from Google Fonts; self-hosting them would remove the last third-party origins from the CSP.
