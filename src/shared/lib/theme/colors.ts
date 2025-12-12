const baseColors = {
  /**
   * Primary colors
   */
  blue: "#1976d2",
  green: "#2e7d32",
  purple: "#9c27b0",
  brown: "#5d4037",
  orange: "#f57c00",
  pink: "#c2185b",

  /**
   * Light variants of primary colors
   */
  lightBlue: "#e3f2fd",
  lightOrange: "#fff3e0",
  lightPink: "#fce4ec",

  /**
   * Gray scale - for text and neutral elements
   */
  darkGray: "#555",
  mediumGray: "#666",
  lightGray: "#777",
  veryLightGray: "#999",
  offWhite: "#fafafa",
  borderGray: "#E0E0E0",
  borderLightGray: "#eee",
} as const;

export const COLORS = {
  ...baseColors,

  signal: {
    hr: baseColors.blue,
    spo2: baseColors.green,
    resp: baseColors.purple,
    position: baseColors.brown,
  },

  text: {
    primary: baseColors.darkGray,
    secondary: baseColors.mediumGray,
    tertiary: baseColors.lightGray,
    muted: baseColors.veryLightGray,
  },

  background: {
    light: baseColors.offWhite,
  },

  border: {
    default: baseColors.borderGray,
    light: baseColors.borderLightGray,
  },
};
