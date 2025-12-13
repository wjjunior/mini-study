import { styled } from "@mui/material/styles";
import Stack from "@mui/material/Stack";

export const StyledResponsiveStack = styled(Stack)(({ theme }) => ({
  flexWrap: "wrap",
  gap: theme.spacing(1),
}));
