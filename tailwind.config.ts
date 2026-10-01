import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#B9A2AC',
        ink: '#050505',
        panel: '#111011',
        panel2: '#181416',
        magenta: '#C51D6F',
        rose: '#F0A4CF'
      },
      boxShadow: {
        soft: '0 18px 60px rgba(0,0,0,.28)'
      },
      borderRadius: {
        xl2: '1.5rem'
      }
    }
  },
  plugins: []
};

export default config;
