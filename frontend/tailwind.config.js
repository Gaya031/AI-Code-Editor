/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#f6f7f9',
        ink: '#17191c',
        muted: '#626b76',
        line: '#dfe3e8',
        accent: '#2563eb'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'monospace']
      }
    }
  },
  plugins: []
};

