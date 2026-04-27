import type { Config } from 'tailwindcss';

// Translation of Andrew's tokens.css into a Tailwind theme.
// Token values are taken verbatim from
//   ClaudeDesignDrop/raw/MBAi-460/src/tokens.css
// so utility classes resolve to the same coral / cream / serif design system.
//
// Dark theme is wired via the `[data-theme="dark"]` selector on `:root`
// (matches Andrew's tokens.css selector strategy).

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        paper: '#F0EEE6',
        'paper-2': '#E8E6DE',
        'paper-3': '#DEDBCF',
        'paper-4': '#D3CFC3',
        ink: '#1E1E1C',
        'ink-2': '#57534E',
        'ink-3': '#8A857E',
        'ink-4': '#A8A396',
        line: '#D3CFC3',
        'line-strong': '#B6B1A3',
        accent: '#CC785C',
        'accent-2': '#B5654B',
        'accent-fg': '#FFFFFF',
        'accent-soft': 'rgba(204, 120, 92, 0.10)',
        'accent-ring': 'rgba(204, 120, 92, 0.32)',
        success: '#2F7D60',
        warn: '#B06B1F',
        error: '#B84545',
        info: '#3F6EAF',
      },
      fontFamily: {
        sans: ['Inter', 'Söhne', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        serif: ['"Source Serif 4"', '"Tiempos Text"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      fontSize: {
        xs: ['12px', { lineHeight: '1.4' }],
        sm: ['13px', { lineHeight: '1.4' }],
        base: ['14px', { lineHeight: '1.5' }],
        md: ['15px', { lineHeight: '1.5' }],
        lg: ['18px', { lineHeight: '1.4' }],
        xl: ['22px', { lineHeight: '1.3' }],
        '2xl': ['28px', { lineHeight: '1.2' }],
        '3xl': ['40px', { lineHeight: '1.2' }],
      },
      spacing: {
        // 4px grid (1 = 4px). Tailwind's default scale already covers 0–96
        // in 4px steps, so we add only the explicit token aliases that match
        // Andrew's tokens.css naming.
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      boxShadow: {
        '1': '0 1px 0 rgba(0,0,0,0.04)',
        '2': '0 8px 24px rgba(28,27,24,0.06)',
        '3': '0 16px 40px rgba(28,27,24,0.10)',
      },
      transitionDuration: {
        fast: '120ms',
        base: '180ms',
        slow: '280ms',
      },
      transitionTimingFunction: {
        ease: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      keyframes: {
        fade: {
          '0%': { opacity: '0', transform: 'translateY(2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shim: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        fade: 'fade 180ms cubic-bezier(0.2, 0.8, 0.2, 1)',
        shim: 'shim 1.4s linear infinite',
      },
      // Andrew's layout sizing tokens
      width: {
        rail: '240px',
      },
      height: {
        topbar: '56px',
      },
    },
  },
  plugins: [],
};

export default config;
