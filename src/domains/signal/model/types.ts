export interface SignalSeries {
  timestamps?: number[];
  values: number[];
  start_time?: number;
  sample_rate?: number;
}

export interface Signals {
  hr?: SignalSeries;
  spo2?: SignalSeries;
  resp?: SignalSeries;
  position?: SignalSeries;
}

export type SignalKey = "hr" | "spo2" | "resp" | "position";

export function isValidSignalKey(key: string): key is SignalKey {
  return ["hr", "spo2", "resp", "position"].includes(key);
}
