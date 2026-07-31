/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#1976D2',
          light: '#E3F2FD',
        },
      },
      maxWidth: {
        phone: '380px',
      },
    },
  },
  plugins: [],
}
