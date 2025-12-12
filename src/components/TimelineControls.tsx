import { useRecoilState, useRecoilValue } from "recoil";
import Stack from "@mui/joy/Stack";
import Button from "@mui/joy/Button";
import Typography from "@mui/material/Typography";
import { studyMetadataAtom } from "../domains/study";
import { timeWindowAtom } from "../shared/store";

const TimelineControls = () => {
  const metadata = useRecoilValue(studyMetadataAtom);
  const [timeWindow, setTimeWindow] = useRecoilState(timeWindowAtom);

  const applyWindow = (windowSizeSeconds: number) => {
    const startSec = metadata?.study_start ?? 0;
    const endSec = Math.min(
      metadata?.study_end ?? startSec + windowSizeSeconds,
      startSec + windowSizeSeconds
    );

    setTimeWindow({
      startSec,
      endSec,
    });
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
        Zoom window:
      </Typography>
      <Button size="sm" variant="outlined" onClick={() => applyWindow(30)}>
        30s
      </Button>
      <Button size="sm" variant="outlined" onClick={() => applyWindow(120)}>
        2 min
      </Button>
      <Button size="sm" variant="outlined" onClick={() => applyWindow(600)}>
        10 min
      </Button>
      <Typography sx={{ fontSize: 12, color: "#777", ml: 1 }}>
        Current: {timeWindow.startSec}s → {timeWindow.endSec}s
      </Typography>
    </Stack>
  );
};

export default TimelineControls;
