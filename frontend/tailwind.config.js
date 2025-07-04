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
        // Cosmic color palette
        cosmic: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8', // Primary cyan
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        neon: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#00d4ff', // Primary neon cyan
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        electric: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f', // Primary electric purple
          900: '#701a75',
        },
        flame: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
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
        // Unique animations
        'cosmic-drift': 'cosmic-drift 20s ease-in-out infinite',
        'energy-pulse': 'energy-pulse 2s ease-in-out infinite',
        'aurora-wave': 'aurora-wave 12s linear infinite',
        'float-particles': 'float-particles 8s ease-in-out infinite',
        'morphing-gradient': 'morphing-gradient 15s ease-in-out infinite',
        'glow-intensity': 'glow-intensity 2s ease-in-out infinite',
        'liquid-morph': 'liquid-morph 6s ease-in-out infinite',
        'button-glow-pulse': 'button-glow-pulse 2s ease-in-out infinite',
        'text-shimmer': 'text-shimmer 3s ease-in-out infinite',
        'cosmic-spin': 'cosmic-spin 1.5s linear infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce 2s infinite',
        'blob': 'blob 7s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 212, 255, 0.5)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.5)',
        'glow-pink': '0 0 20px rgba(255, 0, 110, 0.5)',
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.5)',
        'inner-glow': 'inset 0 0 10px rgba(255, 255, 255, 0.1)',
        'neo': '20px 20px 40px rgba(0, 0, 0, 0.4), -20px -20px 40px rgba(255, 255, 255, 0.02)',
        'neo-hover': '25px 25px 50px rgba(0, 0, 0, 0.5), -25px -25px 50px rgba(255, 255, 255, 0.03)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
      },
      zIndex: {
        '-1': '-1',
        '-2': '-2',
        '-3': '-3',
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '900': '900ms',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'cosmic-gradient': 'linear-gradient(45deg, #0a0a0f 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0a0a0f 100%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'energy-gradient': 'linear-gradient(90deg, #00d4ff 0%, #ff006e 50%, #8b5cf6 100%)',
      },
      backgroundSize: {
        '300': '300%',
        '400': '400%',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    function({ addUtilities, addComponents, theme }) {
      addComponents({
        '.glass-effect': {
          'background': 'rgba(255, 255, 255, 0.05)',
          'backdrop-filter': 'blur(20px)',
          'border': '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.neo-effect': {
          'background': 'linear-gradient(145deg, #1e1e2e, #2a2a3e)',
          'box-shadow': '20px 20px 40px rgba(0, 0, 0, 0.4), -20px -20px 40px rgba(255, 255, 255, 0.02)',
        },
        '.text-gradient': {
          'background': 'linear-gradient(135deg, #00d4ff 0%, #ff006e 50%, #8b5cf6 100%)',
          'background-size': '200% 200%',
          'background-clip': 'text',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.energy-border': {
          'border': '2px solid transparent',
          'background': 'linear-gradient(45deg, #00d4ff, #ff006e, #8b5cf6) border-box',
          'mask': 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          'mask-composite': 'subtract',
        },
      });
      
      addUtilities({
        '.animation-delay-2000': {
          'animation-delay': '2s',
        },
        '.animation-delay-4000': {
          'animation-delay': '4s',
        },
        '.animation-delay-6000': {
          'animation-delay': '6s',
        },
        '.perspective-1000': {
          'perspective': '1000px',
        },
        '.preserve-3d': {
          'transform-style': 'preserve-3d',
        },
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
      });
    },
  ],
} 