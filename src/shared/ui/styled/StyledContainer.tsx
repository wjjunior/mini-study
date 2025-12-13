import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

export const StyledContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  height: "100%",
  boxSizing: "border-box",
  width: "100%",
  maxWidth: "100%",
  overflowX: "hidden",
}));
