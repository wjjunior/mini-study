import { selector } from "recoil";
import { visibleSignalsSelector } from "./visibleSignalsSelector";
import { RECOIL_KEYS } from "../../../../shared/lib/recoil/keys";

export interface SignalStats {
  [key: string]: {
    min: number;
    max: number;
  };
}

export const signalStatsSelector = selector<SignalStats>({
  key: RECOIL_KEYS.SELECTORS.SIGNAL_STATS,
  get: ({ get }) => {
    const visibleSignals = get(visibleSignalsSelector);
    const stats: SignalStats = {};

    Object.entries(visibleSignals).forEach(([key, series]) => {
      if (!series || !series.values || series.values.length === 0) return;

      const values = series.values;
      const min = Math.min(...values);
      const max = Math.max(...values);

      stats[key] = { min, max };
    });

    return stats;
  },
});
