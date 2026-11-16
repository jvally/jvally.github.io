/** Maps the CSS variables in src/input.css to Tailwind utilities. */
const token = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './assets/js/*.js'],
  theme: {
    extend: {
      colors: Object.fromEntries(
        ['navy', 'azure', 'line', 'text', 'muted', 'heading', 'accent'].map((name) => [name, token(name)])
      ),
      fontFamily: {
        display: ['"Kaushan Script"', 'cursive'],
        sans: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
    },
  },
};
