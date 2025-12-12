import { useMemo, useCallback } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import Stack from "@mui/joy/Stack";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { signalsAtom, SignalKey } from "../domains/signal";
import { visibleSignalKeysAtom } from "../shared/store";
import { StyledText } from "../shared/ui/styled";
import type { SignalKey as SignalKeyType } from "../domains/signal/model/types";

const SignalToggles = () => {
  const signals = useRecoilValue(signalsAtom);
  const [visibleKeys, setVisibleKeys] = useRecoilState(visibleSignalKeysAtom);

  const handleToggle = useCallback(
    (key: SignalKeyType) => {
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

  const signalKeys: SignalKeyType[] = useMemo(
    () => [SignalKey.hr, SignalKey.spo2, SignalKey.resp, SignalKey.position],
    []
  );

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <StyledText.Label>Visible signals:</StyledText.Label>
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
