import daisyui from 'daisyui';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        vazir: ['Vazirmatn', 'sans-serif'],
      },
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
          DEFAULT: '#7b3aec',
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
        input: '#1c1c24',
        ring: '#7b3aec',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        dark: {
          'primary': '#7b3aec',
          'primary-content': '#ffffff',
          'secondary': '#1c1c24',
          'secondary-content': '#e4e4e7',
          'accent': '#272730',
          'neutral': '#272730',
          'base-100': '#09090b',
          'base-200': '#121217',
          'base-300': '#1c1c24',
          'base-content': '#f4f4f5',
          'info': '#38bdf8',
          'success': '#10b981',
          'warning': '#f59e0b',
          'error': '#e11d48',
        },
      },
    ],
  },
};
