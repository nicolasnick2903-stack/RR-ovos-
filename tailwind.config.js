/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Identidade R&R Ovos Caipiras — preto, dourado, branco, verde, vermelho.
        preto: { DEFAULT: '#0f0f0f', 800: '#1a1a1a', 700: '#262626' },
        dourado: { DEFAULT: '#f4b91a', 600: '#d99e00', 300: '#fcd968' },
        campo: { DEFAULT: '#2e7d32', 600: '#256628', 300: '#66bb6a' },
        alerta: { DEFAULT: '#d32f2f', 600: '#b71c1c' },
        creme: '#faf7f0',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15,15,15,0.08), 0 1px 2px rgba(15,15,15,0.04)',
        float: '0 8px 24px rgba(15,15,15,0.16)',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.25s ease-out',
      },
    },
  },
  plugins: [],
}
