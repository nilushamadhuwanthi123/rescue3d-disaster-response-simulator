import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--r3d-bg-canvas)',
        surface: 'var(--r3d-bg-surface)',
        'surface-raised': 'var(--r3d-bg-surface-raised)',
        border: 'var(--r3d-border)',
        'text-primary': 'var(--r3d-text-primary)',
        'text-muted': 'var(--r3d-text-muted)',
        ember: {
          DEFAULT: 'var(--r3d-accent-ember)',
          muted: 'var(--r3d-accent-ember-muted)',
        },
        jade: {
          DEFAULT: 'var(--r3d-accent-jade)',
          muted: 'var(--r3d-accent-jade-muted)',
        },
        danger: 'var(--r3d-status-danger)',
        warning: 'var(--r3d-status-warning)',
        success: 'var(--r3d-status-success)',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: 'var(--r3d-radius-sm)',
        md: 'var(--r3d-radius-md)',
        lg: 'var(--r3d-radius-lg)',
      },
    },
  },
  plugins: [],
} satisfies Config;
