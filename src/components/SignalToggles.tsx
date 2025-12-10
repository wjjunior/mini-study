import React from "react"
import { useRecoilState, useRecoilValue } from "recoil"
import Stack from "@mui/joy/Stack"
import Checkbox from "@mui/material/Checkbox"
import FormControlLabel from "@mui/material/FormControlLabel"
import Typography from "@mui/material/Typography"
import { assessmentGlobalState } from "../store/globalStore"

const SignalToggles = () => {
  const [state, setState] = useRecoilState(assessmentGlobalState)
  const { signals, visibleSignals } = useRecoilValue(assessmentGlobalState)

  const handleToggle = (key: "hr" | "spo2" | "resp" | "position") => {
    const nextVisible = { ...visibleSignals }

    if (nextVisible[key]) {
      // hide
      nextVisible[key] = undefined
    } else if (signals[key]) {
      // TO FIX: copy entire series into visibleSignals instead of simple ID
      nextVisible[key] = signals[key]
        ? { ...signals[key]!, values: [...(signals[key]!.values || [])] }
        : undefined
    }

    setState((prev) => ({
      ...prev,
      visibleSignals: nextVisible,
    }))
  }

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
        Visible signals:
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={!!visibleSignals.hr}
            onChange={() => handleToggle("hr")}
          />
        }
        label="HR"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={!!visibleSignals.spo2}
            onChange={() => handleToggle("spo2")}
          />
        }
        label="SpO2"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={!!visibleSignals.resp}
            onChange={() => handleToggle("resp")}
          />
        }
        label="Resp"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={!!visibleSignals.position}
            onChange={() => handleToggle("position")}
          />
        }
        label="Position"
      />
    </Stack>
  )
}

export default SignalToggles
