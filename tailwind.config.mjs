/** @type {import('tailwindcss').Config} */
const tailwindConfig = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    // Primary Disney Colors
    'from-disney-blue', 'to-disney-blue',
    'from-disney-purple', 'to-disney-purple',
    'from-disney-gold', 'to-disney-gold',
    'from-disney-red', 'to-disney-red',
    'from-disney-green', 'to-disney-green',
    'from-disney-orange', 'to-disney-orange',

    // Secondary Colors
    'from-disney-pink', 'to-disney-pink',
    'from-disney-teal', 'to-disney-teal',

    // Park Colors (using primary colors)
    'from-park-magic', 'to-park-magic',
    'from-park-epcot', 'to-park-epcot',
    'from-park-hollywood', 'to-park-hollywood',
    'from-park-animal', 'to-park-animal',
    'from-park-california', 'to-park-california',
    'from-park-paris', 'to-park-paris',
    'from-park-tokyo', 'to-park-tokyo',
    'from-park-tokyo-sea', 'to-park-tokyo-sea',
    'from-park-shanghai', 'to-park-shanghai',
    'from-park-hongkong', 'to-park-hongkong',

    // Text and Background Colors
    'text-disney-blue', 'text-disney-purple', 'text-disney-gold', 'text-disney-red', 'text-disney-green', 'text-disney-orange',
    'bg-disney-blue', 'bg-disney-purple', 'bg-disney-gold', 'bg-disney-red', 'bg-disney-green', 'bg-disney-orange',
    'border-disney-blue', 'border-disney-purple', 'border-disney-gold', 'border-disney-red', 'border-disney-green', 'border-disney-orange',
    'ring-disney-blue', 'ring-disney-purple', 'ring-disney-gold', 'ring-disney-red', 'ring-disney-green', 'ring-disney-orange',
  ],
  theme: {
    extend: {
      colors: {
        // Selected
        'selected': '#001F5C',

        // Primary Disney Colors (6)
        'disney-blue': '#001F5C',
        'disney-purple': '#4C1D95',
        'disney-gold': '#FFD700',
        'disney-red': '#CE1126',
        'disney-green': '#228B22',
        'disney-orange': '#FF8C00',

        // Secondary Colors (6)
        'disney-pink': '#FF69B4',
        'disney-teal': '#00CED1',
        'disney-yellow': '#FFD700',
        'disney-brown': '#8B4513',
        'disney-silver': '#C0C0C0',
        'disney-black': '#000000',

        disney: {
          blue: '#001F5C',
          purple: '#4C1D95',
          gold: '#FFD700',
          red: '#CE1126',
          green: '#228B22',
          orange: '#FF8C00',
          pink: '#FF69B4',
          teal: '#00CED1',
          yellow: '#FFD700',
          brown: '#8B4513',
          silver: '#C0C0C0',
          black: '#000000',
        },

        // Simplified Park Colors - using primary colors
        park: {
          magic: '#001F5C',      // disney-blue
          epcot: '#4C1D95',      // disney-purple
          hollywood: '#CE1126',  // disney-red
          animal: '#228B22',     // disney-green
          california: '#FF8C00', // disney-orange
          paris: '#4C1D95',      // disney-purple
          tokyo: '#FF69B4',      // disney-pink
          'tokyo-sea': '#00CED1', // disney-teal
          shanghai: '#001F5C',   // disney-blue
          hongkong: '#228B22',   // disney-green
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
        'gradient-disney-blue': 'linear-gradient(135deg, #003087, #663399)',
        'gradient-disney-gold': 'linear-gradient(135deg, #FFD700, #FF8C00)',
        'gradient-disney-magic': 'linear-gradient(45deg, #003087, #663399, #FFD700)',
        'gradient-magic': 'linear-gradient(135deg, #4169E1, #9370DB)',
        'gradient-sunset': 'linear-gradient(135deg, #FF8C00, #FF69B4)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

export default tailwindConfig;