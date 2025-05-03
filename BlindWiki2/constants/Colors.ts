import { collectManifestSchemes } from "expo-linking";
// Utility function to darken a hex color
function darkenColor(color: string, percent: number): string {
  // Remove # if present
  const hex = color.charAt(0) === "#" ? color.substring(1) : color;

  // Parse the hex string to RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate darkened values (multiply by percentage)
  const factor = 1 - percent / 100;
  const darkenedR = Math.floor(r * factor);
  const darkenedG = Math.floor(g * factor);
  const darkenedB = Math.floor(b * factor);

  // Convert back to hex
  return `#${darkenedR.toString(16).padStart(2, "0")}${darkenedG
    .toString(16)
    .padStart(2, "0")}${darkenedB.toString(16).padStart(2, "0")}`;
}

// Version: 2.0
const primaryColor = "#0000ff";
const secondaryColor = "#0066cc";
const whiteColor = "#ffffff";
const blackColor = "#000000";
const buttonColor = "#cc1f1f";

export default {
  light: {
    primary: primaryColor,
    secondary: secondaryColor,
    text: blackColor,
    background: whiteColor,
    surface: whiteColor,
    border: "#cccccc",
    formBackground: "#ffff99",
    placeHolderText: "#8e8e8f",
    button: {
      text: whiteColor,
      background: buttonColor,
      shadow: "#000000",
      border: "rgba(0, 0, 0, 0.2)",
      borderBottom: darkenColor(buttonColor, 30),
    },
    tabBar: {
      active: primaryColor,
      inactive: "#404040",
      background: whiteColor,
    },
    tag: {
      background: whiteColor,
      text: blackColor,
      border: blackColor,
      activeBackground: blackColor,
      activeText: whiteColor,
    },
    status: {
      success: "#4CAF50",
      error: "#f44336",
      warning: "#ff9800",
    },
    activityIndicator: secondaryColor,
    topBannerBackground: blackColor,
    topBannerText: whiteColor,
  },
  dark: {
    primary: "#82b1ff",
    secondary: "#448aff",
    text: whiteColor,
    background: "#121212",
    surface: "#1e1e1e",
    border: "#333",
    formBackground: "#fee300",
    tabBar: {
      active: "#82b1ff",
      inactive: "#666",
      background: "#121212",
    },
    status: {
      success: "#81c784",
      error: "#e57373",
      warning: "#ffb74d",
    },
  },
};
