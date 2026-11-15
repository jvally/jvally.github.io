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
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        sans: ['"IBM Plex Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Card hover: a faint accent edge plus a soft drop, no neon glow
        lift: '0 0 0 1px rgb(var(--color-accent) / 0.14), 0 16px 32px -20px rgb(0 0 0 / 0.9)',
      },
    },
  },
  plugins: [],
};
