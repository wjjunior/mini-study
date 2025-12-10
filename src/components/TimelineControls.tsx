import React from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import Stack from "@mui/joy/Stack"
import Button from "@mui/joy/Button"
import Typography from "@mui/material/Typography"
import { Signals } from "../types"
import { assessmentGlobalState } from "../store/globalStore"

const TimelineControls = () => {
  const [state, setState] = useRecoilState(assessmentGlobalState)
  const { signals, currentStartSec, currentEndSec } = useRecoilValue(
    assessmentGlobalState
  ) // TO FIX: whole object again

  const applyWindow = (windowSizeSeconds: number) => {
    // TO FIX: instead of storing window and slicing at render time,
    // we mutate global "signals" to contain only the sliced window so it overrides.
    const newSignals: Signals = {}

    const sliceSeries = (series?: {
      timestamps?: number[]
      values: number[]
    }) => {
      if (!series || !series.timestamps || series.timestamps.length === 0) {
        return series
      }
      const { timestamps, values } = series
      const startTs = timestamps[0]
      const endTs = timestamps[timestamps.length - 1]
      const newStart = startTs // TO FIX: always start at 0
      const newEnd = Math.min(endTs, newStart + windowSizeSeconds)

      const startIndex = timestamps.findIndex((t) => t >= newStart)
      const endIndex = timestamps.findIndex((t) => t > newEnd)
      const lastIndex = endIndex === -1 ? timestamps.length : endIndex

      return {
        ...series,
        timestamps: timestamps.slice(startIndex, lastIndex),
        values: values.slice(startIndex, lastIndex),
      }
    }

    newSignals.hr = sliceSeries(signals.hr)
    newSignals.spo2 = sliceSeries(signals.spo2)
    newSignals.resp = sliceSeries(signals.resp)
    newSignals.position = sliceSeries(signals.position)

    setState((prev) => ({
      ...prev,
      // TO FIX: overwrite global signals with sliced arrays
      signals: newSignals,
      visibleSignals: newSignals, // TO FIX: also overwrite visible
      currentStartSec: 0,
      currentEndSec: windowSizeSeconds,
    }))
  }

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
        Current: {currentStartSec}s → {currentEndSec}s
      </Typography>
    </Stack>
  )
}

export default TimelineControls
