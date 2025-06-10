/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Modern Fitness Color Palette
        neon: {
          50: '#f0fdf9',
          100: '#ccfdf7',
          200: '#99f9f0',
          300: '#5eeee6',
          400: '#26d9d7',
          500: '#0dbfc0',
          600: '#05989c',
          700: '#0a7a7e',
          800: '#0e6066',
          900: '#134e56',
        },
        electric: {
          50: '#f0f4ff',
          100: '#e0e6ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        flame: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        lime: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#365314',
          900: '#1a2e05',
        },
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          850: '#172033',
          900: '#0f172a',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'scale-in': 'scale-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'fade-in': 'fade-in 0.6s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { 
            boxShadow: '0 0 20px rgba(38, 217, 215, 0.3), 0 0 40px rgba(38, 217, 215, 0.1)' 
          },
          '100%': { 
            boxShadow: '0 0 30px rgba(38, 217, 215, 0.6), 0 0 60px rgba(38, 217, 215, 0.2)' 
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'bounce-gentle': {
          '0%, 100%': { 
            transform: 'translateY(0)', 
            animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' 
          },
          '50%': { 
            transform: 'translateY(-5px)', 
            animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' 
          },
        },
        'pulse-glow': {
          '0%, 100%': { 
            opacity: '1', 
            boxShadow: '0 0 0 0 rgba(132, 204, 22, 0.7)' 
          },
          '50%': { 
            opacity: '0.8', 
            boxShadow: '0 0 0 10px rgba(132, 204, 22, 0)' 
          },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'fitness-gradient': 'linear-gradient(135deg, #26d9d7 0%, #84cc16 100%)',
        'electric-gradient': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'flame-gradient': 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
        'cosmic-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'aurora': 'linear-gradient(135deg, #26d9d7 0%, #6366f1 25%, #8b5cf6 50%, #84cc16 75%, #f97316 100%)',
        'mesh-gradient': 'radial-gradient(circle at 25% 25%, #26d9d7 0%, transparent 50%), radial-gradient(circle at 75% 75%, #6366f1 0%, transparent 50%), radial-gradient(circle at 50% 50%, #8b5cf6 0%, transparent 50%)',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(38, 217, 215, 0.5), 0 0 40px rgba(38, 217, 215, 0.2)',
        'electric': '0 0 20px rgba(99, 102, 241, 0.5), 0 0 40px rgba(99, 102, 241, 0.2)',
        'flame': '0 0 20px rgba(249, 115, 22, 0.5), 0 0 40px rgba(249, 115, 22, 0.2)',
        'lime': '0 0 20px rgba(132, 204, 22, 0.5), 0 0 40px rgba(132, 204, 22, 0.2)',
        'glow-lg': '0 20px 60px -10px rgba(38, 217, 215, 0.3)',
        'inner-glow': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
} 