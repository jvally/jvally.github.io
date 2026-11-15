# DESIGN.md — Vishesh Jally portfolio

Design reference for `index.html`. Read this before changing styles; update it when a token or component changes.

## Direction

The page reads as one shell session. Each section is a command in a left rail with its output beside it, and the page scrolls as a single document instead of a stack of boxed panels. Dark, quiet, typographic: the developer flavour comes from the structure, not from decoration.

- Stack: HTML5, Tailwind CSS 3 (compiled with the Tailwind CLI), vanilla JavaScript.
- Files: `index.html` (markup), `src/input.css` (tokens and component classes), `tailwind.config.js` (token-to-utility mapping), `assets/js/main.js` (behaviour and the unlock game), `assets/js/boot.js` (switches the game on before first paint). `assets/css/styles.css` is build output; never edit it.
- Dark only. No light theme yet.

## Colour tokens

Defined once as space-separated RGB triplets in the `:root` block of `src/input.css`, mapped to Tailwind colour names in `tailwind.config.js`. Change a value in `:root` and every utility follows (`bg-surface`, `text-accent/40`, ...).

| Token | Tailwind name | Value | Role |
| --- | --- | --- | --- |
| `--color-bg` | `bg` | `#0d0f12` | Page canvas |
| `--color-surface` | `surface` | `#14171c` | Cards, terminal input |
| `--color-border` | `border` | `#262b33` | Hairlines, card outlines |
| `--color-text` | `text` | `#bec5ce` | Body text |
| `--color-muted` | `muted` | `#808994` | Secondary text, dates, stack lines |
| `--color-heading` | `heading` | `#eceff3` | Headings, primary button fill |
| `--color-accent` | `accent` | `#7ed39e` | Prompt `$`, links, cursor, focus ring, active nav link |

The palette is closed: canvas, surface, border, three text tones, one accent. The accent is ink only: it colours small marks and text, never a large fill. The primary button is off-white, not green.

## Typography

| Use | Family | Notes |
| --- | --- | --- |
| Headings, commands, nav, buttons, dates, labels | IBM Plex Mono (`font-mono`) | Weights 400 / 500 / 600 |
| Body copy | IBM Plex Sans (`font-sans`) | Weight 400, `leading-relaxed` |

- Hero name: `text-4xl`, `sm:text-6xl`, semibold. It is the only large type on the page.
- Section commands: `text-sm`, medium. They are labels, not banners.
- Card and entry titles: `text-base`, semibold. Body inside cards: `text-sm`.
- Sub-headings (`.subhead`): `text-xs`, uppercase, tracked, muted.

## Layout

- Content width: `max-w-5xl`, side padding `px-5` (`sm:px-8`) via `.container-page`.
- Every section, the hero included, uses `.section-grid`: an 11rem rail for the command and a flexible column for the output, from `md` up. Below `md` the command sits above its output.
- The command (`.section-cmd`) is sticky under the header on desktop, so it stays in view while its output scrolls.
- Sections are separated by space only (`py-9`, `md:py-12`). No divider lines between sections and no alternating backgrounds.
- Projects grid is 1 column, 2 from `sm`; the featured first card spans both.
- Nav collapses to a hamburger menu below `md`.

## Shell-session conventions

- Section headings are commands. `.section-cmd` adds a green `$ ` prefix; the visible command sits in an `aria-hidden` span and the plain section name in an `sr-only` span, so screen readers hear "About", not the command.
- Commands in use: `whoami` (hero), `cat about.md`, `ls projects/`, `cat experience.log`, `./contact.sh`.
- Brand mark is `~/vishesh` with the `~/` in accent.
- There is one blinking cursor on the page, and it means something: it marks the next command waiting to be run.
- Nav links keep plain labels (About, Projects, ...) for clarity.

```html
<section id="skills" class="section">
  <div class="container-page section-grid">
    <h2 class="section-cmd"><span aria-hidden="true">cat skills.txt</span><span class="sr-only">Skills</span></h2>
    <div class="section-body" data-unlock="cat skills.txt">
      ...
    </div>
  </div>
</section>
```

## Components

All shared styling lives in the `@layer components` block of `src/input.css`. Edit there, not on individual elements, then rebuild (`npm run dev` watches for changes).

| Class | Purpose |
| --- | --- |
| `.container-page` | Centred content column |
| `.section`, `.section--hero`, `.section-grid` | Section spacing and the rail + output grid |
| `.section-cmd`, `.section-body` | The command and its output |
| `.subhead` | Small uppercase label inside a section |
| `.hero-name`, `.hero-sub`, `.hero-intro` | Hero text |
| `.nav-link`, `.nav-link.active` | Mono nav links; `active` is set by the scroll observer |
| `.btn-primary` | Off-white solid button |
| `.btn-ghost` | Bordered button |
| `.card` | Bordered surface panel, flex column |
| `.card-hover` | Hover: 2px lift, accent-tinted border, soft shadow (`shadow-lift`). Projects only |
| `.card-head`, `.card-title`, `.card-date` | Title row with the date pushed right |
| `.card-body`, `.card-list` | Card text and its dash-marked list |
| `.card-stack` | Tech stack as one mono line, items joined with ` · `, pinned to the card bottom |
| `.card-link` | Small mono link to a repo or write-up, placed before the stack line |
| `.kv` | Key/value list (the About environment block) |
| `.entries`, `.entry-org` | Experience entries, separated by a hairline |
| `.contact-email` | The large email link |
| `.link` | Inline accent link |

Adding a project: copy an `<article class="card card-hover">` block in the projects grid and change the title, date, text and stack line. Add `sm:col-span-2` to feature it at full width.

Adding an experience entry: copy an `<li>` inside `.entries`.

## Unlock game

Sections and project cards start locked; a terminal bar fixed to the bottom of the page takes commands that reveal them one at a time.

- A step is any element with a `data-unlock` attribute. Its value is the exact command or flag that reveals it. Steps unlock in page order.
- Sections: `data-unlock` goes on the `.section-body`. While locked, the section collapses to its command alone, so the locked part of the page is a short queue of commands. The next one carries the cursor and a `run` button; typing it in the terminal does the same.
- Project cards: `data-unlock="flag{...}"` goes on the `<article>`. The flag for a card is shown at the bottom of the card before it, so a visitor reads a project, takes its flag and submits it to decrypt the next one.
- Terminal commands: `help`, `hint`, `ls`, `whoami`, `clear`, `reset`, `sudo unlock --all` (or `skip`).
- Progress is kept in `localStorage` (`vj:unlocked`, `vj:done`). Finishing or skipping collapses the bar to one line with a `replay` button.

Rules:

- Nothing may be permanently hidden. `skip` is always visible in the terminal bar, "show everything" sits under the hero buttons, and with JavaScript off the game never starts and the whole page is visible.
- The game is decoration, not access control: commands and flags are readable in the page source.
- Visitor input is compared as a string and echoed with `textContent` only.
- To exempt an element, remove its `data-unlock`.

| Class | Purpose |
| --- | --- |
| `.terminal-dock`, `.term-*` | The fixed terminal bar, its output line, input and buttons |
| `.section.is-locked`, `.section.is-next` | Set by the script on a section whose body is locked / is the next step |
| `.lock-panel`, `.lock-title`, `.lock-hint` | Placeholder shown inside a locked element |
| `.run-btn`, `.run-note` | The run button beside the next command |
| `.cmd-chip` | Clickable command or flag; runs its `data-run` value |
| `.flag-drop` | "flag found" line appended to a card |
| `.game-only` | Shown only while the game is running |
| `.just-unlocked` | One-off reveal animation |

Files: `assets/js/boot.js` adds the `game` class to `<html>` before first paint; the logic is `initGame()` in `assets/js/main.js`; styles are section 4 of `src/input.css`.

## Motion

- Colour transitions on links and buttons: 150ms. Card hover: 200ms.
- Unlocking fades the new content in over 500ms and scrolls to it.
- The cursor on the next command blinks. Nothing else animates on its own.
- Smooth scrolling for in-page links.
- `prefers-reduced-motion: reduce` disables all transitions, animations and smooth scrolling.

## Writing

- Plain sentences in the first person. Say what was built and what it does.
- No em dashes, no slogans, no claims the resume does not support.
- Dates and tech stacks are set in mono as quiet metadata, not as badges.

## Accessibility

- Skip-to-content link is the first focusable element.
- Visible focus ring: 2px accent outline on `:focus-visible`.
- Mobile menu button keeps `aria-expanded` in sync and closes on Escape.
- The terminal output is a polite live region; the input has a screen-reader label.
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
- Keep the accent for the prompt `$`, links, the cursor and focus.
- Let space separate sections. Put new content in the output column of a `.section-grid`.
- Check the page at 390px wide after any layout change.

## Don't

- Hard-code hex colours in markup.
- Add a second accent colour, gradients, glow shadows or per-section background tints.
- Turn metadata into pills or badges, number the cards, or add icons and emoji for decoration.
- Add a second blinking cursor, typewriter text or scroll-triggered animation.
- Fill a button or panel with the accent colour.
- Lock content without a skip path, or add a step whose answer is not shown on the page.

## Open items

- Only the CTF card links to a repository. Paranoid Planner, the Juice Shop write-up, TripShield and the HTTP server have `TODO` comments where their links go.
- Fonts load from Google Fonts; self-hosting them would remove the last third-party origins from the CSP.
