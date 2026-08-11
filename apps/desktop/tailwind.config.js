export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        foreground: '#f4f4f5',
        card: {
          DEFAULT: '#121217',
          foreground: '#f4f4f5',
        },
        popover: {
          DEFAULT: '#121217',
          foreground: '#f4f4f5',
        },
        primary: {
          DEFAULT: '#7c3aed',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#1c1c24',
          foreground: '#e4e4e7',
        },
        muted: {
          DEFAULT: '#272730',
          foreground: '#a1a1aa',
        },
        accent: {
          DEFAULT: '#272730',
          foreground: '#f4f4f5',
        },
        destructive: {
          DEFAULT: '#e11d48',
          foreground: '#ffffff',
        },
        border: '#272730',
        input: '#272730',
        ring: '#7c3aed',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
};
