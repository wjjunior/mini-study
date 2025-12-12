import { selector } from "recoil";
import { Signals, SignalKey } from "../../model/types";
import { signalsAtom } from "../atoms/signalsAtom";
import { visibleSignalKeysAtom } from "../../../../shared/store/atoms/uiAtoms";
import { RECOIL_KEYS } from "../../../../shared/lib/recoil/keys";

export const visibleSignalsSelector = selector<Signals>({
  key: RECOIL_KEYS.SELECTORS.VISIBLE_SIGNALS,
  get: ({ get }) => {
    const signals = get(signalsAtom);
    const visibleKeys = get(visibleSignalKeysAtom);

    const visibleSignals: Signals = {};

    visibleKeys.forEach((key: SignalKey) => {
      if (signals[key]) {
        visibleSignals[key] = signals[key];
      }
    });

    return visibleSignals;
  },
});
