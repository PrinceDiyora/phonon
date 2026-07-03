/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          50: "#eaf3ef",
          100: "#cce4d6",
          500: "#228b4d",
          600: "#1b7440",
          700: "#186B44", // Primary from Donezo
          900: "#0e4129",
        },
      },
    },
  },
  plugins: [],
};
