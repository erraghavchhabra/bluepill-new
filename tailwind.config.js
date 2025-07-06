/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        beep: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "1" },
        },
      },
      animation: {
        beep: "beep 1s infinite",
      },
      colors: {
        primary: '#03e8d3',
        primary2: '#028B7E',
        primary3: '#07E5D1',
        primary_light: '#E6FCFA',
        
        gray_light: "#FAFAFA",
        background: '#f1efe7',
        blue: {
          50: '#e6fcfa',
          100: '#ccfaf5',
          200: '#99f5eb',
          300: '#66f0e2',
          400: '#33ebd8',
          500: '#03e8d3',
          600: '#02b9a8',
          700: '#028b7e',
          800: '#015c54',
          900: '#012e2a'
        }
      }
    },
  },
  plugins: [require('tailwind-scrollbar-hide'),],
};