import { useRecoilState, useRecoilValue } from "recoil";
import Stack from "@mui/joy/Stack";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import { signalsAtom, visibleSignalsSelector } from "../domains/signal";
import { visibleSignalKeysAtom } from "../shared/store";
import type { SignalKey } from "../domains/signal/model/types";

const SignalToggles = () => {
  const signals = useRecoilValue(signalsAtom);
  const visibleSignals = useRecoilValue(visibleSignalsSelector);
  const [visibleKeys, setVisibleKeys] = useRecoilState(visibleSignalKeysAtom);

  const handleToggle = (key: SignalKey) => {
    const newVisibleKeys = new Set(visibleKeys);

    if (newVisibleKeys.has(key)) {
      newVisibleKeys.delete(key);
    } else if (signals[key]) {
      newVisibleKeys.add(key);
    }

    setVisibleKeys(newVisibleKeys);
  };

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
  );
};

export default SignalToggles;
