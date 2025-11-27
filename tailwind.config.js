/** @type {import('tailwindcss').Config} */
export const content = [
  './pages/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
  './app/**/*.{js,ts,jsx,tsx,mdx}',
];
export const theme = {
  extend: {
    colors: {
      'coffee': {
        light: '#FAF3E4', 
        medium: '#D2B48C',
        dark: '#6F4E37', 
        brown: '#8B4513' 
      },
      'amber': {
        50: '#FFFBEB',
        100: '#FEF3C7',
        200: '#FDE68A',
        300: '#FCD34D',
        400: '#FBBF24',
        500: '#F59E0B',
      }
    },
    animation: {
      'float': 'float 6s ease-in-out infinite',
      'float-reverse': 'float-reverse 5s ease-in-out infinite',
      'steam': 'steam 4s ease-out infinite',
      'pulse-slow': 'pulse 3s ease-in-out infinite',
    },
    keyframes: {
      float: {
        '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
        '50%': { transform: 'translateY(-20px) rotate(5deg)' }
      },
      'float-reverse': {
        '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
        '50%': { transform: 'translateY(-15px) rotate(-5deg)' }
      },
      steam: {
        '0%': { opacity: 0, transform: 'translateY(0) scale(1)' },
        '50%': { opacity: 1 },
        '100%': { opacity: 0, transform: 'translateY(-100px) scale(2)' }
      }
    },
    backgroundImage: {
      'coffee-gradient': 'linear-gradient(135deg, #FAF3E4 0%, #FEF3C7 100%)',
      'coffee-dark-gradient': 'linear-gradient(135deg, #6F4E37 0%, #8B4513 100%)',
    },
    boxShadow: {
      'coffee': '0 10px 30px -10px rgba(111, 78, 55, 0.3)',
      'coffee-lg': '0 20px 40px -15px rgba(111, 78, 55, 0.4)',
    }
  },
};
export const plugins = [require("daisyui")];
export const daisyui = {
  themes: [
    {
      coffee: {
        "primary": "#6F4E37", 
        "secondary": "#D2B48C", 
        "accent": "#8B4513", 
        "neutral": "#FAF3E4", 
        "base-100": "#FFFFFF",
        "base-200": "#F8F5F0",
        "base-300": "#F0EBE0",
        "info": "#3ABFF8",
        "success": "#36D399",
        "warning": "#FBBD23",
        "error": "#F87272",
      }
    }
  ]
};