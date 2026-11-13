# Vishesh Jally — portfolio

Static personal site: HTML, Tailwind CSS 3 (compiled with the Tailwind CLI) and vanilla JavaScript. Design rules are in [DESIGN.md](DESIGN.md).

## Layout

| Path | Purpose |
| --- | --- |
| `index.html` | Page markup and content |
| `src/input.css` | Theme tokens and component classes (Tailwind source) |
| `tailwind.config.js` | Maps tokens to Tailwind utilities |
| `assets/js/main.js` | Mobile menu, smooth scroll, active nav link, unlock game |
| `assets/js/boot.js` | Turns the unlock game on before first paint |
| `assets/css/styles.css` | Build output. Committed so the site also renders when Pages serves the branch directly; run `npm run build` before committing style changes |
| `dist/` | Deployable site, not committed |
| `.nojekyll` | Tells Pages to serve files as they are, without Jekyll |
| `.github/workflows/deploy.yml` | Builds and deploys to GitHub Pages |

## Develop

Requires Node.js 18 or later.

```bash
npm install
```

```bash
npm run dev
```

`npm run dev` recompiles the CSS on every change. Open `index.html` in a browser, or serve the built site:

```bash
npm run preview
```

## Build

```bash
npm run build
```

Writes minified CSS to `assets/css/styles.css` and assembles the deployable site in `dist/`.

## Deploy to GitHub Pages

1. Create a GitHub repository and push this folder to its `main` branch. Name it `jvally.github.io` to serve the site at `https://jvally.github.io/`; any other name serves it at `https://jvally.github.io/<repo>/`.
2. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Every push to `main` then builds and deploys the site. The workflow can also be run by hand from the **Actions** tab.

All asset paths are relative, so the site works at either URL without changes.
