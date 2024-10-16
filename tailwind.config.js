/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    mode: "jit",
    content: [
      "./src/**/*.{js,jsx,ts,tsx}", // Apenas arquivos necessários
      "./app/**/*.{js,jsx,ts,tsx}", // Inclui arquivos da pasta app (Expo Router)
    ],
    presets: [require("nativewind/preset")],
    theme: {
      extend: {},
    },
    plugins: [],
  }