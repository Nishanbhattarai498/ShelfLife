module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#22c55e", // Green-500
        secondary: "#f59e0b", // Amber-500
        danger: "#ef4444",
      },
    },
  },
  plugins: [],
}
