import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { COLORS } from "../../lib/theme";

type BaselineVariant = "baseline60" | "baseline70" | "default";

interface StyledBaselineBoxProps {
  variant?: BaselineVariant;
}

const getBackgroundColor = (variant: BaselineVariant) => {
  switch (variant) {
    case "baseline60":
      return COLORS.lightBlue;
    case "baseline70":
      return COLORS.lightOrange;
    default:
      return COLORS.lightPink;
  }
};

const getBorderColor = (variant: BaselineVariant) => {
  switch (variant) {
    case "baseline60":
      return COLORS.blue;
    case "baseline70":
      return COLORS.orange;
    default:
      return COLORS.pink;
  }
};

export const StyledBaselineBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "variant",
})<StyledBaselineBoxProps>(({ theme, variant = "default" }) => ({
  padding: theme.spacing(1),
  width: "200px",
  backgroundColor: getBackgroundColor(variant),
  border: "2px solid",
  borderColor: getBorderColor(variant),
  borderRadius: theme.shape.borderRadius,
}));
