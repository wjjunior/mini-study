import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { COLORS } from "../../lib/theme";

export const StyledSignalPlotBox = styled(Box)(({ theme }) => ({
  border: `1px solid ${COLORS.borderGray}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1),
  width: "100%",
  maxWidth: "100%",
  overflow: "hidden",
  boxSizing: "border-box",
}));
