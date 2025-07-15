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
        disney: {
          blue: '#003087',
          gold: '#FFD700',
          red: '#CE1126',
          purple: '#663399',
          teal: '#00CED1',
          pink: '#FF69B4',
          green: '#228B22',
          orange: '#FF8C00',
        },
        park: {
          magic: '#4169E1',
          epcot: '#9370DB',
          hollywood: '#DC143C',
          animal: '#228B22',
          california: '#FF4500',
          paris: '#8A2BE2',
        }
      },
      zIndex: {
        'modal': '1400',
        'dropdown': '1000',
        'overlay': '1300',
        'tooltip': '1800',
      },
      fontFamily: {
        disney: ['Comic Sans MS', 'cursive'],
        elegant: ['Georgia', 'serif'],
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        sparkle: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.5, transform: 'scale(1.1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      backgroundImage: {
        'gradient-disney': 'linear-gradient(45deg, #003087, #FFD700, #CE1126)',
        'gradient-magic': 'linear-gradient(135deg, #4169E1, #9370DB)',
        'gradient-sunset': 'linear-gradient(135deg, #FF8C00, #FF69B4)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}