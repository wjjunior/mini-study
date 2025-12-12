import { useMemo, useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import Stack from "@mui/joy/Stack";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import { signalsAtom } from "../domains/signal";
import { visibleSignalKeysAtom } from "../shared/store";
import type { SignalKey } from "../domains/signal/model/types";

const SignalToggles = () => {
  const signals = useRecoilValue(signalsAtom);
  const [visibleKeys, setVisibleKeys] = useRecoilState(visibleSignalKeysAtom);

  const handleToggle = useCallback(
    (key: SignalKey) => {
      setVisibleKeys((prevKeys) => {
        const newVisibleKeys = new Set(prevKeys);
        if (newVisibleKeys.has(key)) {
          newVisibleKeys.delete(key);
        } else if (signals[key]) {
          newVisibleKeys.add(key);
        }
        return newVisibleKeys;
      });
    },
    [signals, setVisibleKeys]
  );

  const signalKeys: SignalKey[] = useMemo(
    () => ["hr", "spo2", "resp", "position"],
    []
  );

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
        Visible signals:
      </Typography>
      {signalKeys.map((key) => {
        const signal = signals[key];
        const isVisible = visibleKeys.has(key) && !!signal;
        return (
          <FormControlLabel
            key={key}
            control={
              <Checkbox
                checked={isVisible}
                onChange={() => handleToggle(key)}
                disabled={!signal}
              />
            }
            label={key.charAt(0).toUpperCase() + key.slice(1)}
          />
        );
      })}
    </Stack>
  );
};

export default SignalToggles;
