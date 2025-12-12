import { selector } from "recoil";
import { Signals, SignalKey } from "../../model/types";
import { windowedSignalsSelector } from "./windowedSignalsSelector";
import { visibleSignalKeysAtom } from "../../../../shared/store/atoms/uiAtoms";
import { RECOIL_KEYS } from "../../../../shared/lib/recoil/keys";

export const displaySignalsSelector = selector<Signals>({
  key: RECOIL_KEYS.SELECTORS.DISPLAY_SIGNALS,
  get: ({ get }) => {
    const windowedSignals = get(windowedSignalsSelector);
    const visibleKeys = get(visibleSignalKeysAtom);

    const displaySignals: Signals = {};

    visibleKeys.forEach((key: SignalKey) => {
      if (windowedSignals[key]) {
        displaySignals[key] = windowedSignals[key];
      }
    });

    return displaySignals;
  },
});
