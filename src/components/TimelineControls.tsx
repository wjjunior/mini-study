import { useCallback, useMemo } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import Button from "@mui/material/Button";
import { studyMetadataAtom } from "../domains/study";
import { timeWindowAtom } from "../shared/store";
import { StyledText, StyledResponsiveStack } from "../shared/ui/styled";

const TimelineControls = () => {
  const metadata = useRecoilValue(studyMetadataAtom);
  const [timeWindow, setTimeWindow] = useRecoilState(timeWindowAtom);

  const applyWindow = useCallback(
    (windowSizeSeconds: number) => {
      const startSec = metadata?.study_start ?? 0;
      const endSec = Math.min(
        metadata?.study_end ?? startSec + windowSizeSeconds,
        startSec + windowSizeSeconds
      );

      setTimeWindow({
        startSec,
        endSec,
      });
    },
    [metadata, setTimeWindow]
  );

  const windowSizes = useMemo(() => [30, 120, 600], []);

  const formatWindowSize = useCallback((seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${seconds / 60} min`;
    return `${seconds / 3600} h`;
  }, []);

  return (
    <StyledResponsiveStack direction="row" spacing={1} alignItems="center">
      <StyledText.Label>Zoom window:</StyledText.Label>
      {windowSizes.map((size) => (
        <Button
          key={size}
          size="small"
          variant="outlined"
          onClick={() => applyWindow(size)}
        >
          {formatWindowSize(size)}
        </Button>
      ))}
      <StyledText.TertiaryWithMargin>
        Current: {timeWindow.startSec}s → {timeWindow.endSec}s
      </StyledText.TertiaryWithMargin>
    </StyledResponsiveStack>
  );
};

export default TimelineControls;
