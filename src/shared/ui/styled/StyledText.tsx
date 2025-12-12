import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { COLORS } from "../../lib/theme";

export const StyledSignalTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(0.5),
}));

export const StyledText = {
  Primary: styled(Typography)({
    color: COLORS.darkGray,
  }),
  Secondary: styled(Typography)({
    fontSize: 13,
    color: COLORS.lightGray,
  }),
  Tertiary: styled(Typography)({
    fontSize: 12,
    color: COLORS.lightGray,
  }),
  Muted: styled(Typography)({
    fontSize: 12,
    color: COLORS.veryLightGray,
  }),
  Label: styled(Typography)({
    fontSize: 14,
    fontWeight: 600,
  }),
  Stats: styled(Typography)(({ theme }) => ({
    fontSize: 12,
    color: COLORS.mediumGray,
    marginBottom: theme.spacing(1),
  })),
  BaselineLabel: styled(Typography)({
    fontSize: 13,
    fontWeight: 600,
  }),
  TertiaryWithMargin: styled(Typography)(({ theme }) => ({
    fontSize: 12,
    color: COLORS.lightGray,
    marginLeft: theme.spacing(1),
  })),
};
