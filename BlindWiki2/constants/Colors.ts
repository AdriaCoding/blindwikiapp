import { collectManifestSchemes } from "expo-linking";

// Version: 2.0
const primaryColor = '#0000ff';
const secondaryColor = '#0066cc';
const whiteColor = '#ffffff';
const blackColor = '#000000';

export default {
  light: {
    primary: primaryColor,
    secondary: secondaryColor,
    text: blackColor,
    background: whiteColor,
    surface: whiteColor,
    border: '#cccccc',
    formBackground: '#ffff99',
    placeHolderText: '#8e8e8f',
    button: {
      text: whiteColor,
      background: '#404040'
    },
    tabBar: {
      active: primaryColor,
      inactive: '#404040',
      background: whiteColor
    },
    tag:{
      background: whiteColor,
      text: blackColor,
      border: blackColor,
      activeBackground: blackColor,
      activeText: whiteColor
    },
    status: {
      success: '#4CAF50',
      error: '#f44336',
      warning: '#ff9800'
    },
    activityIndicator: secondaryColor,
    topBannerBackground: blackColor,
    topBannerText: whiteColor,
  },
  dark: {
    primary: '#82b1ff',
    secondary: '#448aff',
    text: whiteColor,
    background: '#121212',
    surface: '#1e1e1e',
    border: '#333',
    formBackground: '#fee300',
    tabBar: {
      active: '#82b1ff',
      inactive: '#666',
      background: '#121212'
    },
    status: {
      success: '#81c784',
      error: '#e57373',
      warning: '#ffb74d'
    }
  }
};