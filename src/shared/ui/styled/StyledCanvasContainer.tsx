import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

const PADDING = 24;

interface StyledCanvasContainerProps {
  height?: number;
}

export const StyledCanvasContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "height",
})<StyledCanvasContainerProps>(({ height }) => ({
  width: "100%",
  maxWidth: "100%",
  height: height ? `${height}px` : "auto",
  position: "relative",
  overflow: "hidden",
  padding: PADDING,
  boxSizing: "border-box",
}));
