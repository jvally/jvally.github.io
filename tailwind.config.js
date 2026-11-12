/** Maps the CSS variables in src/input.css to Tailwind utilities. */
const token = (name) => `rgb(var(${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './assets/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        bg: token('--color-bg'),
        surface: token('--color-surface'),
        border: token('--color-border'),
        text: token('--color-text'),
        muted: token('--color-muted'),
        heading: token('--color-heading'),
        accent: token('--color-accent'),
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgb(var(--color-accent) / 0.5), 0 8px 30px -8px rgb(var(--color-accent) / 0.35)',
      },
    },
  },
  plugins: [],
};
