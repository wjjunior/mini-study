import React, { useEffect } from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Stack from "@mui/joy/Stack"
import Button from "@mui/joy/Button"
import { useRecoilState, useRecoilValue } from "recoil"
import MiniSignalPlot from "./MiniSignalPlot"
import { fetchStudy, fetchEvents } from "../api/mockApi"
import { assessmentGlobalState } from "../store/globalStore"
import SignalToggles from "./SignalToggles"
import TimelineControls from "./TimelineControls"

const AssessmentContainer = () => {
  const [state, setState] = useRecoilState(assessmentGlobalState)
  const {
    studyId,
    loading,
    error,
    visibleSignals,
    chartWidth,
    chartHeight,
    events,
    pollMs,
  } = useRecoilValue(assessmentGlobalState) // BAD: subscribe to everything

  // TO FIX: Race condition - if studyId changes during fetch, wrong data may be displayed
  useEffect(() => {
    let cancelled = false
    setState((prev) => ({
      ...prev,
      loading: true,
      error: undefined,
    }))

    const controller = new AbortController()

    fetchStudy(studyId, controller.signal)
      .then((data) => {
        if (cancelled) return
        // TO FIX: store everything in one atom, including "visibleSignals"
        setState((prev) => ({
          ...prev,
          loading: false,
          error: undefined,
          signals: data.signals,
          visibleSignals: {
            hr: data.signals.hr ? { ...data.signals.hr } : undefined,
            spo2: data.signals.spo2 ? { ...data.signals.spo2 } : undefined,
            resp: data.signals.resp ? { ...data.signals.resp } : undefined,
            position: data.signals.position
              ? { ...data.signals.position }
              : undefined,
          },
          events: data.events,
          lastFetchedAt: Date.now(),
          // TO FIX: set window based on metadata but still store in global state
          currentStartSec: data.metadata.study_start,
          currentEndSec: data.metadata.study_end,
        }))
      })
      .catch((err) => {
        if (cancelled) return
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err?.message || "Failed to load study",
        }))
      })

    // TO FIX: ignoring AbortController on cleanup, and not actually calling abort
    return () => {
      cancelled = true
      // controller.abort() // intentionally NOT called
    }
  }, [studyId, setState])

  // TO FIX: polling events with setInterval, no cleanup, and using pollMs in deps
  useEffect(() => {
    const id = setInterval(() => {
      fetchEvents(studyId).then((newEvents) => {
        // TO FIX: re-write events + lastFetchedAt, causing global re-renders
        setState((prev) => ({
          ...prev,
          events: newEvents,
          lastFetchedAt: Date.now(),
        }))
      })
    }, pollMs)

    // BAD: no clearInterval -> memory leak + duplicate polling
    // return () => clearInterval(id)
  }, [pollMs, studyId, setState])

  return (
    <Box sx={{ p: 2, height: "100%", boxSizing: "border-box" }}>
      <Stack spacing={2}>
        <Typography variant="h3" sx={{ fontSize: 22, fontWeight: 600 }}>
          Assessment: Mini Study Viewer
        </Typography>
        <Typography sx={{ color: "#555" }}>
          Check the README.
        </Typography>

        <Typography sx={{ fontSize: 13, color: "#777" }}>
          Study: <b>{studyId}</b> |{" "}
          {loading ? "Loading..." : error ? `Error: ${error}` : "Loaded"}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
            Switch study (test race conditions):
          </Typography>
          <Button
            size="sm"
            variant="outlined"
            onClick={() =>
              setState((prev) => ({ ...prev, studyId: "demo-study-001" }))
            }
          >
            Study 1
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() =>
              setState((prev) => ({ ...prev, studyId: "demo-study-002" }))
            }
          >
            Study 2
          </Button>
          <Button
            size="sm"
            variant="outlined"
            onClick={() =>
              setState((prev) => ({ ...prev, studyId: "demo-study-003" }))
            }
          >
            Study 3
          </Button>
        </Stack>

        {visibleSignals.hr && (
          <Box
            sx={{
              p: 1,
              width: "200px",
              backgroundColor:
                visibleSignals.hr.values[0] === 60
                  ? "#e3f2fd"
                  : visibleSignals.hr.values[0] === 70
                  ? "#fff3e0"
                  : "#fce4ec",
              border: "2px solid",
              borderColor:
                visibleSignals.hr.values[0] === 60
                  ? "#1976d2"
                  : visibleSignals.hr.values[0] === 70
                  ? "#f57c00"
                  : "#c2185b",
              borderRadius: 1,
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
              HR baseline is {visibleSignals.hr.values[0]} bpm
            </Typography>
          </Box>
        )}

        <SignalToggles />

        <TimelineControls />

        <Typography sx={{ fontSize: 12, color: "#999" }}>
          Events in current study: {events.length}
        </Typography>

        {/* TO FIX: render each possible signal even if not present, all relying on global visibleSignals */}
        {visibleSignals.hr && (
          <MiniSignalPlot
            title="HR"
            width={chartWidth}
            height={chartHeight}
            values={visibleSignals.hr.values}
            timestamps={visibleSignals.hr.timestamps}
            color="#1976d2"
          />
        )}
        {visibleSignals.spo2 && (
          <MiniSignalPlot
            title="SpO2"
            width={chartWidth}
            height={chartHeight}
            values={visibleSignals.spo2.values}
            timestamps={visibleSignals.spo2.timestamps}
            color="#2e7d32"
          />
        )}
        {visibleSignals.resp && (
          <MiniSignalPlot
            title="Resp"
            width={chartWidth}
            height={chartHeight}
            values={visibleSignals.resp.values}
            timestamps={visibleSignals.resp.timestamps}
            color="#9c27b0"
          />
        )}
        {visibleSignals.position && (
          <MiniSignalPlot
            title="Position"
            width={chartWidth}
            height={chartHeight}
            values={visibleSignals.position.values}
            timestamps={visibleSignals.position.timestamps}
            color="#5d4037"
          />
        )}
      </Stack>
    </Box>
  )
}

export default AssessmentContainer
