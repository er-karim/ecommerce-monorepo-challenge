import type { Config } from "tailwindcss";
import sharedConfig from "@repo/tailwind-config";

const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  presets: [sharedConfig],
  daisyui: sharedConfig.daisyui,
};

export default config;
