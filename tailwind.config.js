/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#fdf6ec',
        parchment: '#f7ecd6',
        ink: '#3b2a20',
        cocoa: '#5b3a29',
        moss: '#6b8e4e',
        rose: '#c97064',
        gold: '#d4a24c',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        display: ['Georgia', 'Cambria', 'serif'],
      },
      fontSize: {
        // Accessibility-first: oversized defaults for the 40+ demo.
        base: ['1.125rem', '1.6'],
        lg: ['1.25rem', '1.6'],
        xl: ['1.5rem', '1.5'],
        '2xl': ['1.875rem', '1.4'],
        '3xl': ['2.25rem', '1.3'],
      },
    },
  },
  plugins: [],
};
