import { atom } from "recoil";
import { SignalKey } from "../../../domains/signal/model/types";
import { RECOIL_KEYS } from "../../lib/recoil/keys";

export const visibleSignalKeysAtom = atom<Set<SignalKey>>({
  key: RECOIL_KEYS.UI.VISIBLE_SIGNAL_KEYS,
  default: new Set<SignalKey>(),
});

export interface TimeWindow {
  startSec: number;
  endSec: number;
}

export const timeWindowAtom = atom<TimeWindow>({
  key: RECOIL_KEYS.UI.TIME_WINDOW,
  default: {
    startSec: 0,
    endSec: 600,
  },
});

export interface ChartDimensions {
  width: number;
  height: number;
}

export const chartDimensionsAtom = atom<ChartDimensions>({
  key: RECOIL_KEYS.UI.CHART_DIMENSIONS,
  default: {
    width: 1000,
    height: 300,
  },
});

export const loadingStateAtom = atom<boolean>({
  key: RECOIL_KEYS.UI.LOADING_STATE,
  default: false,
});

export interface ErrorState {
  message: string;
  context?: string;
  timestamp?: number;
}

export const errorStateAtom = atom<ErrorState | null>({
  key: RECOIL_KEYS.UI.ERROR_STATE,
  default: null,
});

export const pollMsAtom = atom<number>({
  key: RECOIL_KEYS.UI.POLL_MS,
  default: 2000,
});

export const lastFetchedAtAtom = atom<number | undefined>({
  key: RECOIL_KEYS.UI.LAST_FETCHED_AT,
  default: undefined,
});
