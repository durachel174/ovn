import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
        fontFamily: {
        sans: ['var(--font-playfair)', 'serif'],
        serif: ['var(--font-dm-sans)', 'sans-serif'],
        },
        colors: {
        mauve: {
            50:  '#fdf6f7',
            100: '#f7e8eb',
            200: '#eecdd3',
            300: '#e0a8b2',
            400: '#cc7d8d',
            500: '#b8606f',
            600: '#9e4a58',
            700: '#833d49',
            800: '#6e353f',
            900: '#5e3038',
        },
        },
    },
    },
  plugins: [],
}

export default config