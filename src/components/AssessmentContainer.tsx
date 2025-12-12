import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/joy/Stack";
import Button from "@mui/joy/Button";
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
import SignalToggles from "./SignalToggles";
import TimelineControls from "./TimelineControls";
import { filteredEventsSelector } from "../domains/study/store/selectors/filteredEventsSelector";

const AssessmentContainer = () => {
  const [studyId, setStudyId] = useRecoilState(studyIdAtom);

  const loading = useRecoilValue(loadingStateAtom);
  const error = useRecoilValue(errorStateAtom);
  const chartDimensions = useRecoilValue(chartDimensionsAtom);

  const displaySignals = useRecoilValue(displaySignalsSelector);
  const events = useRecoilValue(filteredEventsSelector);

  useStudyData();
  useEventPolling();

  return (
    <Box sx={{ p: 2, height: "100%", boxSizing: "border-box" }}>
      <Stack spacing={2}>
        <Typography variant="h3" sx={{ fontSize: 22, fontWeight: 600 }}>
          Assessment: Mini Study Viewer
        </Typography>
        <Typography sx={{ color: "#555" }}>Check the README.</Typography>

        <Typography sx={{ fontSize: 13, color: "#777" }}>
          Study: <b>{studyId}</b> |{" "}
          {loading
            ? "Loading..."
            : error
            ? `Error: ${error.message}`
            : "Loaded"}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
            Switch study (test race conditions):
          </Typography>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setStudyId(createStudyId("demo-study-001"))}
          >
            Study 1
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setStudyId(createStudyId("demo-study-002"))}
          >
            Study 2
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setStudyId(createStudyId("demo-study-003"))}
          >
            Study 3
          </Button>
        </Stack>

        {displaySignals.hr && (
          <Box
            sx={{
              p: 1,
              width: "200px",
              backgroundColor:
                displaySignals.hr.values[0] === 60
                  ? "#e3f2fd"
                  : displaySignals.hr.values[0] === 70
                  ? "#fff3e0"
                  : "#fce4ec",
              border: "2px solid",
              borderColor:
                displaySignals.hr.values[0] === 60
                  ? "#1976d2"
                  : displaySignals.hr.values[0] === 70
                  ? "#f57c00"
                  : "#c2185b",
              borderRadius: 1,
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
              HR baseline is {displaySignals.hr.values[0]} bpm
            </Typography>
          </Box>
        )}

        <SignalToggles />

        <TimelineControls />

        <Typography sx={{ fontSize: 12, color: "#999" }}>
          Events in current study: {events.length}
        </Typography>

        {/* TO FIX: render each possible signal even if not present, all relying on global visibleSignals */}
        {displaySignals.hr && (
          <MiniSignalPlot
            title="HR"
            width={chartDimensions.width}
            height={chartDimensions.height}
            values={displaySignals.hr.values}
            timestamps={displaySignals.hr.timestamps}
            color="#1976d2"
          />
        )}
        {displaySignals.spo2 && (
          <MiniSignalPlot
            title="SpO2"
            width={chartDimensions.width}
            height={chartDimensions.height}
            values={displaySignals.spo2.values}
            timestamps={displaySignals.spo2.timestamps}
            color="#2e7d32"
          />
        )}
        {displaySignals.resp && (
          <MiniSignalPlot
            title="Resp"
            width={chartDimensions.width}
            height={chartDimensions.height}
            values={displaySignals.resp.values}
            timestamps={displaySignals.resp.timestamps}
            color="#9c27b0"
          />
        )}
        {displaySignals.position && (
          <MiniSignalPlot
            title="Position"
            width={chartDimensions.width}
            height={chartDimensions.height}
            values={displaySignals.position.values}
            timestamps={displaySignals.position.timestamps}
            color="#5d4037"
          />
        )}
      </Stack>
    </Box>
  );
};

export default AssessmentContainer;
