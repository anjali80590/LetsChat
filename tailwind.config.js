// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: ["./src/**/*.{js,jsx,ts,tsx}"],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// };
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // must be 'class', not 'media'
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // include all your source files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
