/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f5ff',
          100: '#e6ecff',
          200: '#c3d1ff',
          300: '#9fb5ff',
          400: '#5c7dff',
          500: '#1a4dff',
          600: '#153fd1',
          700: '#1032a3',
          800: '#0b2475',
          900: '#071852',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 30px rgba(10, 20, 60, 0.06)',
        glass: '0 8px 32px rgba(31, 41, 55, 0.08)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
