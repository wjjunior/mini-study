import { selector } from "recoil";
import { Signals, SignalSeries } from "../../model/types";
import { signalsAtom } from "../atoms/signalsAtom";
import { timeWindowAtom } from "../../../../shared/store/atoms/uiAtoms";
import { RECOIL_KEYS } from "../../../../shared/lib/recoil/keys";

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

function sliceSignalByTimeWindow(
  series: SignalSeries,
  startSec: number,
  endSec: number
): SignalSeries | undefined {
  if (!series.timestamps || series.timestamps.length === 0) {
    return series;
  }

  const { timestamps, values } = series;

  const startIndex = timestamps.findIndex((t) => t >= startSec);
  const endIndex = timestamps.findIndex((t) => t > endSec);

  if (startIndex === -1) {
    return undefined;
  }

  const lastIndex = endIndex === -1 ? timestamps.length : endIndex;

  return {
    ...series,
    timestamps: timestamps.slice(startIndex, lastIndex),
    values: values.slice(startIndex, lastIndex),
  };
}
