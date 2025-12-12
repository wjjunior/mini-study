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

export const SignalKey = {
  hr: "hr",
  spo2: "spo2",
  resp: "resp",
  position: "position",
} as const;

export type SignalKey = (typeof SignalKey)[keyof typeof SignalKey];

export function isValidSignalKey(key: string): key is SignalKey {
  return (Object.values(SignalKey) as string[]).includes(key);
}
