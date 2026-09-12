/** @type {import('tailwindcss').Config} */
// Design tokens are owned by the uxui-designer agent.
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // colors, fontFamily, spacing tokens go here
    },
  },
  plugins: [],
};
