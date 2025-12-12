import { createTheme } from "@mui/material/styles";
import { COLORS } from "./colors";

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: COLORS.blue,
    },
    secondary: {
      main: COLORS.green,
    },
    error: {
      main: COLORS.pink,
    },
    warning: {
      main: COLORS.orange,
    },
    info: {
      main: COLORS.blue,
    },
    success: {
      main: COLORS.green,
    },
    text: {
      primary: COLORS.darkGray,
      secondary: COLORS.mediumGray,
      disabled: COLORS.veryLightGray,
    },
    background: {
      default: COLORS.offWhite,
      paper: "#ffffff",
    },
    divider: COLORS.borderGray,
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
    h3: {
      fontSize: 22,
      fontWeight: 600,
    },
    body1: {
      fontSize: 14,
    },
    body2: {
      fontSize: 12,
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          color: COLORS.darkGray,
        },
      },
    },
  },
});
