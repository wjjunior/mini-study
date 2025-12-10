import { atom } from "recoil"
import { GlobalState } from "../types"

// TO FIX: BAD PATTERN: a single global atom for "everything"
export const assessmentGlobalState = atom<GlobalState>({
  key: "assessmentGlobalState",
  default: {
    studyId: "demo-study-001",
    loading: false,
    error: undefined,
    signals: {},
    visibleSignals: {}, // TO FIX: will hold copies of signals
    events: [],
    yMin: undefined,
    yMax: undefined,
    chartWidth: 1000,
    chartHeight: 300,
    autoScale: true,
    lastFetchedAt: undefined,
    pollMs: 2000,
    // TO FIX: magic number default window that doesn't come from data
    currentStartSec: 0,
    currentEndSec: 600,
  },
})
