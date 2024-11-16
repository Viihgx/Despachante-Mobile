/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Inclui arquivos necessários da pasta src
    "./app/**/*.{js,jsx,ts,tsx}", // Inclui arquivos necessários da pasta app
  ],
  exclude: [
    "./node_modules", // Exclui o diretório node_modules
    "./node_modules/.cache/**", // Exclui a pasta de cache do NativeWind
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
