import { useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/joy/Stack";
import Button from "@mui/joy/Button";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import MiniSignalPlot from "./MiniSignalPlot";
import { fetchStudy, fetchEvents } from "../api/mockApi";
import {
  studyIdAtom,
  studyMetadataAtom,
  eventsAtom,
  createStudyId,
} from "../domains/study";
import { signalsAtom, displaySignalsSelector } from "../domains/signal";
import {
  loadingStateAtom,
  errorStateAtom,
  chartDimensionsAtom,
  pollMsAtom,
  lastFetchedAtAtom,
  timeWindowAtom,
  visibleSignalKeysAtom,
} from "../shared/store";
import SignalToggles from "./SignalToggles";
import TimelineControls from "./TimelineControls";
import { filteredEventsSelector } from "../domains/study/store/selectors/filteredEventsSelector";
import type { SignalKey } from "../domains/signal/model/types";

const AssessmentContainer = () => {
  const [studyId, setStudyId] = useRecoilState(studyIdAtom);
  const setMetadata = useSetRecoilState(studyMetadataAtom);
  const setSignals = useSetRecoilState(signalsAtom);
  const setEvents = useSetRecoilState(eventsAtom);

  const loading = useRecoilValue(loadingStateAtom);
  const error = useRecoilValue(errorStateAtom);
  const chartDimensions = useRecoilValue(chartDimensionsAtom);
  const pollMs = useRecoilValue(pollMsAtom);

  const displaySignals = useRecoilValue(displaySignalsSelector);
  const events = useRecoilValue(filteredEventsSelector);

  const setLoading = useSetRecoilState(loadingStateAtom);
  const setError = useSetRecoilState(errorStateAtom);
  const setLastFetchedAt = useSetRecoilState(lastFetchedAtAtom);
  const setTimeWindow = useSetRecoilState(timeWindowAtom);
  const setVisibleKeys = useSetRecoilState(visibleSignalKeysAtom);

  // TO FIX: Race condition - if studyId changes during fetch, wrong data may be displayed
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    fetchStudy(studyId, controller.signal)
      .then((data) => {
        if (cancelled) return;

        setMetadata(data.metadata);
        setSignals(data.signals);
        setEvents(data.events);
        setTimeWindow({
          startSec: data.metadata.study_start,
          endSec: data.metadata.study_end,
        });

        const availableKeys = new Set<SignalKey>(
          Object.keys(data.signals).filter(
            (key) => data.signals[key as keyof typeof data.signals]
          ) as SignalKey[]
        );
        setVisibleKeys(availableKeys);

        setLastFetchedAt(Date.now());
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoading(false);
        setError({
          message: err?.message || "Failed to load study",
          context: "fetchStudy",
          timestamp: Date.now(),
        });
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [
    studyId,
    setLoading,
    setError,
    setMetadata,
    setSignals,
    setEvents,
    setTimeWindow,
    setLastFetchedAt,
    setVisibleKeys,
  ]);

  // TO FIX: polling events with setInterval, no cleanup, and using pollMs in deps
  useEffect(() => {
    const id = setInterval(() => {
      fetchEvents(studyId).then((newEvents) => {
        // TO FIX: should verify studyId hasn't changed before updating
        setEvents(newEvents);
        setLastFetchedAt(Date.now());
      });
    }, pollMs);

    return () => clearInterval(id);
  }, [pollMs, studyId, setEvents, setLastFetchedAt]);

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
