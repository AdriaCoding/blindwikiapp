import { collectManifestSchemes } from "expo-linking";

// Version: 2.0
// Paleta principal
const palette = {
  primary: {
    main: '#3D5AFE',     // Un azul más moderno que el actual
    light: '#8187FF',
    dark: '#0031CA',
    contrast: '#FFFFFF'
  },
  secondary: {
    main: '#7C4DFF',    // Violeta/púrpura
    light: '#B47CFF',
    dark: '#3F1DCB',
    contrast: '#FFFFFF'
  },
  neutral: {
    50: '#F8F9FA',
    100: '#F1F3F5',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#868E96',
    700: '#495057',
    800: '#343A40',
    900: '#212529'
  },
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3'
};

export default {
  light: {
    primary: palette.primary.main,
    primaryLight: palette.primary.light,
    primaryDark: palette.primary.dark,
    secondary: palette.secondary.main,
    text: palette.neutral[900],
    textSecondary: palette.neutral[700],
    background: palette.neutral[50],
    surface: '#FFFFFF',
    border: palette.neutral[300],
    formBackground: palette.secondary.light,
    placeHolderText: palette.neutral[600],
    button: {
      text: '#FFFFFF',
      background: palette.primary.main
    },
    tabBar: {
      active: palette.primary.main,
      inactive: palette.neutral[500],
      background: '#FFFFFF'
    },
    tag:{
      background: '#FFFFFF',
      text: palette.neutral[900],
      border: palette.neutral[400],
      activeBackground: palette.primary.main,
      activeText: '#FFFFFF'
    },
    status: {
      success: palette.success,
      error: palette.error,
      warning: palette.warning,
      info: palette.info
    },
    activityIndicator: palette.primary.main
  },
  dark: {
    primary: palette.primary.light,
    primaryLight: palette.primary.main,
    primaryDark: palette.primary.dark,
    secondary: palette.secondary.light,
    text: '#FFFFFF',
    textSecondary: palette.neutral[400],
    background: '#121212',
    surface: '#1E1E1E',
    border: palette.neutral[700],
    formBackground: palette.secondary.dark,
    placeHolderText: palette.neutral[500],
    button: {
      text: palette.neutral[900],
      background: palette.primary.light
    },
    tabBar: {
      active: palette.primary.light,
      inactive: palette.neutral[600],
      background: '#121212'
    },
    tag:{
      background: palette.neutral[800],
      text: '#FFFFFF',
      border: palette.neutral[700],
      activeBackground: palette.primary.light,
      activeText: palette.neutral[900]
    },
    status: {
      success: '#81C784',
      error: '#E57373',
      warning: '#FFB74D',
      info: '#64B5F6'
    },
    activityIndicator: palette.primary.light
  }
};