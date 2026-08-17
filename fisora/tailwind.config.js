/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0A1120',
          900: '#0F1B2D',
          850: '#12213A',
          800: '#152640',
          700: '#1B3254',
          600: '#264673',
          500: '#32598F',
        },
        brand: {
          orange: '#E8963F',
          amber: '#FF9500',
          gold: '#F5A623',
          red: '#E84430',
          coral: '#FF4B3A',
          blue: '#2D6EB5',
          steel: '#3B698C',
        },
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-orange': '0 0 25px rgba(232, 150, 63, 0.25)',
        'glow-red': '0 0 25px rgba(232, 68, 48, 0.25)',
        'glow-blue': '0 0 25px rgba(45, 110, 181, 0.25)',
      },
    },
  },
  plugins: [],
};
