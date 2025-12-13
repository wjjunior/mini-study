import { styled } from "@mui/material/styles";

const PADDING = 24;

export const StyledCanvas = styled("canvas")({
  width: `calc(100% - ${PADDING * 2}px)`,
  height: `calc(100% - ${PADDING * 2}px)`,
  maxWidth: "100%",
  display: "block",
});
