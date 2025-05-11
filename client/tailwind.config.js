/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
      extend: {
        colors: {
          dark: '#1a1a2e', // Dark purple background
          primary: '#16213e', // Slightly lighter purple for gradient
          neon: '#00ffcc', // Neon accent for buttons and borders
          accent: '#00ffcc', // Same as neon for consistency
        },
      },
    },
    plugins: [],
  };