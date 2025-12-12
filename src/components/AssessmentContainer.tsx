import { useCallback, useMemo } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { useRecoilState, useRecoilValue } from "recoil";
import MiniSignalPlot from "./MiniSignalPlot";
import {
  studyIdAtom,
  createStudyId,
  useStudyData,
  useEventPolling,
} from "../domains/study";
import { displaySignalsSelector } from "../domains/signal";
import {
  loadingStateAtom,
  errorStateAtom,
  chartDimensionsAtom,
} from "../shared/store";
import { COLORS } from "../shared/lib/theme";
import {
  StyledContainer,
  StyledTitle,
  StyledText,
  StyledBaselineBox,
} from "../shared/ui/styled";
import SignalToggles from "./SignalToggles";
import TimelineControls from "./TimelineControls";
import { filteredEventsSelector } from "../domains/study/store/selectors/filteredEventsSelector";
import { SignalKey } from "../domains/signal";

const AssessmentContainer = () => {
  const [studyId, setStudyId] = useRecoilState(studyIdAtom);

  const loading = useRecoilValue(loadingStateAtom);
  const error = useRecoilValue(errorStateAtom);
  const chartDimensions = useRecoilValue(chartDimensionsAtom);

  const displaySignals = useRecoilValue(displaySignalsSelector);
  const events = useRecoilValue(filteredEventsSelector);

  useStudyData();
  useEventPolling();

  const handleStudyChange = useCallback(
    (studyNumber: string) => {
      setStudyId(createStudyId(`demo-study-${studyNumber}`));
    },
    [setStudyId]
  );

  const signalConfigs = useMemo(
    () => [
      { key: SignalKey.hr, title: "HR", color: COLORS.signal.hr },
      { key: SignalKey.spo2, title: "SpO2", color: COLORS.signal.spo2 },
      { key: SignalKey.resp, title: "Resp", color: COLORS.signal.resp },
      {
        key: SignalKey.position,
        title: "Position",
        color: COLORS.signal.position,
      },
    ],
    []
  );

  const getBaselineVariant = (): "baseline60" | "baseline70" | "default" => {
    if (!displaySignals.hr) return "default";
    const value = displaySignals.hr.values[0];
    if (value === 60) return "baseline60";
    if (value === 70) return "baseline70";
    return "default";
  };

  return (
    <StyledContainer>
      <Stack spacing={2}>
        <StyledTitle variant="h3">Assessment: Mini Study Viewer</StyledTitle>
        <StyledText.Primary>Check the README.</StyledText.Primary>

        <StyledText.Secondary>
          Study: <b>{studyId}</b> |{" "}
          {loading
            ? "Loading..."
            : error
            ? `Error: ${error.message}`
            : "Loaded"}
        </StyledText.Secondary>

        <Stack direction="row" spacing={1} alignItems="center">
          <StyledText.Label>
            Switch study (test race conditions):
          </StyledText.Label>
          {["001", "002", "003"].map((num) => (
            <Button
              key={num}
              size="small"
              variant="outlined"
              onClick={() => handleStudyChange(num)}
            >
              Study {num.slice(-1)}
            </Button>
          ))}
        </Stack>

        {displaySignals.hr && (
          <StyledBaselineBox variant={getBaselineVariant()}>
            <StyledText.BaselineLabel>
              HR baseline is {displaySignals.hr.values[0]} bpm
            </StyledText.BaselineLabel>
          </StyledBaselineBox>
        )}

        <SignalToggles />

        <TimelineControls />

        <StyledText.Muted>
          Events in current study: {events.length}
        </StyledText.Muted>

        {signalConfigs.map((config) => {
          const signal = displaySignals[config.key];
          if (!signal) return null;

          return (
            <MiniSignalPlot
              key={config.key}
              title={config.title}
              width={chartDimensions.width}
              height={chartDimensions.height}
              values={signal.values}
              timestamps={signal.timestamps}
              color={config.color}
            />
          );
        })}
      </Stack>
    </StyledContainer>
  );
};

export default AssessmentContainer;
