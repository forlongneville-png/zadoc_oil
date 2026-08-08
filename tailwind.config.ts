import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        zadoc: {
          background: 'var(--zadoc-background)',
          foreground: 'var(--zadoc-foreground)',
          muted: 'var(--zadoc-muted)',
          success: 'var(--zadoc-success)',
          avoid: 'var(--zadoc-avoid)',
          border: 'var(--zadoc-border)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
      borderRadius: {
        card: '1.75rem',
        pill: '999px',
        zadoc: '1.75rem',
        'zadoc-sm': '1.25rem',
        sheet: '1.75rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(17, 17, 17, 0.04), 0 8px 24px -12px rgba(17, 17, 17, 0.08)',
      },
      keyframes: {
        'fade-scale': {
          '0%': { opacity: '0.4', transform: 'scale(0.96)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0.4', transform: 'scale(0.96)' },
        },
      },
      animation: {
        'fade-scale': 'fade-scale 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
