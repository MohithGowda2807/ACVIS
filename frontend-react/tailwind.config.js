/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        amazon: {
          dark: '#131921',
          nav: '#232f3e',
          navHover: '#37475a',
          orange: '#ff9900',
          orangeHover: '#e68a00',
          yellow: '#febd69',
          yellowHover: '#f3a847',
          blue: '#007185',
          blueHover: '#c7f3ff',
          lightBg: '#eaeded',
          cardBg: '#ffffff',
          star: '#de7921',
          starFill: '#ffa41c',
          link: '#007185',
          success: '#067d62',
          danger: '#b12704',
          warning: '#c45500',
        },
      },
      fontFamily: {
        amazon: ['"Amazon Ember"', 'Arial', 'sans-serif'],
        sans: ['Arial', 'sans-serif'],
      },
      boxShadow: {
        'amazon': '0 2px 5px rgba(15,17,17,.15)',
        'amazon-lg': '0 4px 12px rgba(15,17,17,.15)',
        'amazon-card': '0 1px 3px rgba(0,0,0,.12), 0 1px 2px rgba(0,0,0,.06)',
      }
    },
  },
  plugins: [],
}
