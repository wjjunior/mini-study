import { selector } from "recoil";
import { Signals } from "../../model/types";
import { signalsAtom } from "../atoms/signalsAtom";
import { timeWindowAtom } from "../../../../shared/store/atoms/uiAtoms";
import { RECOIL_KEYS } from "../../../../shared/lib/recoil/keys";
import { sliceSignalByTimeWindow } from "../../../../shared/lib/utils";

export const windowedSignalsSelector = selector<Signals>({
  key: RECOIL_KEYS.SELECTORS.WINDOWED_SIGNALS,
  get: ({ get }) => {
    const signals = get(signalsAtom);
    const timeWindow = get(timeWindowAtom);

    const windowedSignals: Signals = {};

    Object.entries(signals).forEach(([key, series]) => {
      if (!series) return;

      const filtered = sliceSignalByTimeWindow(
        series,
        timeWindow.startSec,
        timeWindow.endSec
      );
      if (filtered && filtered.values.length > 0) {
        windowedSignals[key as keyof Signals] = filtered;
      }
    });

    return windowedSignals;
  },
});
