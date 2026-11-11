import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { Easing } from "remotion";

export const { fontFamily: sans } = loadInter("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
});
export const { fontFamily: mono } = loadMono("normal", {
  weights: ["400", "600"],
  subsets: ["latin"],
});

export const C = {
  bg: "#F6F4FE",
  grid: "rgba(91, 63, 214, 0.07)",
  ink: "#1B1340",
  muted: "#6B6590",
  purple: "#5B3FD6",
  purpleDeep: "#3A22A8",
  lavender: "#E9E4FF",
  card: "#FFFFFF",
  aws: "#FF9900",
  docker: "#2496ED",
  node: "#5FA04E",
  red: "#E5484D",
  amber: "#F5A524",
};

export const ease = Easing.bezier(0.16, 1, 0.3, 1);

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;
