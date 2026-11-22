import type { Config } from "tailwindcss";

// Couleurs de l'identité NGF : les mêmes noms qu'avant, mais pilotés par des variables (voir src/styles/ngf.css) pour suivre le mode clair ou sombre.
const scale = (n: number) => `rgb(var(--c-s${n}) / <alpha-value>)`;
const stone = { 50: scale(50), 100: scale(100), 200: scale(200), 300: scale(300), 400: scale(400), 500: scale(500), 600: scale(600), 700: scale(700), 800: scale(800), 900: scale(900) };
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        white: "rgb(var(--c-white) / <alpha-value>)",
        stone,
        neutral: { ...stone, 900: "rgb(11 11 16 / <alpha-value>)" },
        emerald: { 50: "#FBF3DC", 100: "#F5E6B3", 200: "#ECD48C", 300: "#E8C45A", 600: "#A87C12", 700: "#8A6508", 800: "#7E5C06", 900: "#644804", 950: "#4A3503" },
        amber: { 50: "#FFF1E6", 100: "#FFE2CC", 500: "#FB7A3C", 900: "#7C2D12", 950: "#5C200A" },
        red: { 50: "#FDECEE", 100: "#FAD4D9", 700: "#C81C34", 800: "#A01428", 900: "#8C1224" },
      },
      fontFamily: { display: ["Nunito", "Trebuchet MS", "system-ui", "sans-serif"], sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
