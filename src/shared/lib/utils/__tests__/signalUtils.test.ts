import { sliceSignalByTimeWindow, downsampleSignal } from "../signalUtils";
import type { SignalSeries } from "../../../../domains/signal/model/types";

describe("signalUtils", () => {
  describe("sliceSignalByTimeWindow", () => {
    it("should return original series when no timestamps", () => {
      const series: SignalSeries = {
        values: [1, 2, 3, 4, 5],
      };

      const result = sliceSignalByTimeWindow(series, 0, 100);

      expect(result).toEqual(series);
    });

    it("should return undefined when start time is after all timestamps", () => {
      const series: SignalSeries = {
        values: [1, 2, 3],
        timestamps: [10, 20, 30],
      };

      const result = sliceSignalByTimeWindow(series, 100, 200);

      expect(result).toBeUndefined();
    });

    it("should slice signal correctly within time window", () => {
      const series: SignalSeries = {
        values: [1, 2, 3, 4, 5],
        timestamps: [10, 20, 30, 40, 50],
      };

      const result = sliceSignalByTimeWindow(series, 20, 40);

      expect(result).toEqual({
        values: [2, 3, 4],
        timestamps: [20, 30, 40],
      });
    });

    it("should include all data when end time is after last timestamp", () => {
      const series: SignalSeries = {
        values: [1, 2, 3, 4, 5],
        timestamps: [10, 20, 30, 40, 50],
      };

      const result = sliceSignalByTimeWindow(series, 20, 100);

      expect(result).toEqual({
        values: [2, 3, 4, 5],
        timestamps: [20, 30, 40, 50],
      });
    });

    it("should preserve other properties from series", () => {
      const series: SignalSeries = {
        values: [1, 2, 3],
        timestamps: [10, 20, 30],
        start_time: 10,
        sample_rate: 1,
      };

      const result = sliceSignalByTimeWindow(series, 15, 35);

      expect(result).toEqual({
        values: [2, 3],
        timestamps: [20, 30],
        start_time: 10,
        sample_rate: 1,
      });
    });

    it("should handle exact timestamp matches", () => {
      const series: SignalSeries = {
        values: [1, 2, 3, 4, 5],
        timestamps: [10, 20, 30, 40, 50],
      };

      const result = sliceSignalByTimeWindow(series, 20, 30);

      expect(result).toEqual({
        values: [2, 3],
        timestamps: [20, 30],
      });
    });

    it("should return empty arrays when window has no data", () => {
      const series: SignalSeries = {
        values: [1, 2, 3],
        timestamps: [10, 20, 30],
      };

      const result = sliceSignalByTimeWindow(series, 15, 16);

      expect(result).toEqual({
        values: [],
        timestamps: [],
      });
    });
  });

  describe("downsampleSignal", () => {
    describe("edge cases", () => {
      it("should return original data when length <= targetCount", () => {
        const values = [1, 2, 3];
        const timestamps = [10, 20, 30];

        const result = downsampleSignal(values, timestamps, 5);

        expect(result).toEqual({ values, timestamps });
      });

      it("should return original data when targetCount < 2", () => {
        const values = [1, 2, 3, 4, 5];
        const timestamps = [10, 20, 30, 40, 50];

        const result = downsampleSignal(values, timestamps, 1);

        expect(result).toEqual({ values, timestamps });
      });

      it("should handle empty arrays", () => {
        const values: number[] = [];
        const timestamps: number[] = [];

        const result = downsampleSignal(values, timestamps, 10);

        expect(result).toEqual({ values: [], timestamps: [] });
      });
    });

    describe("without timestamps", () => {
      it("should downsample evenly when no timestamps", () => {
        const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const targetCount = 5;

        const result = downsampleSignal(values, undefined, targetCount);

        expect(result.values.length).toBeLessThanOrEqual(targetCount + 1);
        expect(result.timestamps).toBeUndefined();
        expect(result.values[0]).toBe(values[0]);
        expect(result.values[result.values.length - 1]).toBe(
          values[values.length - 1]
        );
      });

      it("should include first and last values", () => {
        const values = Array.from({ length: 100 }, (_, i) => i);
        const targetCount = 10;

        const result = downsampleSignal(values, undefined, targetCount);

        expect(result.values[0]).toBe(0);
        expect(result.values[result.values.length - 1]).toBe(99);
      });

      it("should handle mismatched timestamp length", () => {
        const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const timestamps = [10, 20, 30];

        const result = downsampleSignal(values, timestamps, 5);

        expect(result.timestamps).toBeUndefined();
        expect(result.values.length).toBeLessThanOrEqual(6);
      });
    });

    describe("with timestamps (LTTB algorithm)", () => {
      it("should downsample using LTTB algorithm", () => {
        const values = Array.from({ length: 100 }, (_, i) => Math.sin(i / 10));
        const timestamps = Array.from({ length: 100 }, (_, i) => i * 10);
        const targetCount = 20;

        const result = downsampleSignal(values, timestamps, targetCount);

        expect(result.values.length).toBe(targetCount);
        expect(result.timestamps?.length).toBe(targetCount);
        expect(result.values[0]).toBe(values[0]);
        expect(result.values[result.values.length - 1]).toBe(
          values[values.length - 1]
        );
      });

      it("should preserve first and last points", () => {
        const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const timestamps = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
        const targetCount = 5;

        const result = downsampleSignal(values, timestamps, targetCount);

        expect(result.values[0]).toBe(1);
        expect(result.values[result.values.length - 1]).toBe(10);
        expect(result.timestamps?.[0]).toBe(10);
        expect(result.timestamps?.[result.timestamps.length - 1]).toBe(100);
      });

      it("should handle large datasets", () => {
        const size = 10000;
        const values = Array.from(
          { length: size },
          (_, i) => Math.random() * 100
        );
        const timestamps = Array.from({ length: size }, (_, i) => i);
        const targetCount = 1000;

        const result = downsampleSignal(values, timestamps, targetCount);

        expect(result.values.length).toBe(targetCount);
        expect(result.timestamps?.length).toBe(targetCount);
        expect(result.values[0]).toBe(values[0]);
        expect(result.values[result.values.length - 1]).toBe(
          values[values.length - 1]
        );
      });

      it("should maintain visual characteristics of signal", () => {
        const values = [
          10, 12, 15, 18, 20, 18, 15, 12, 10, 8, 10, 12, 15, 18, 20, 18, 15, 12,
          10, 8,
        ];
        const timestamps = Array.from({ length: 20 }, (_, i) => i * 10);
        const targetCount = 10;

        const result = downsampleSignal(values, timestamps, targetCount);

        expect(result.values.length).toBe(targetCount);
        const minOriginal = Math.min(...values);
        const maxOriginal = Math.max(...values);
        const minDownsampled = Math.min(...result.values);
        const maxDownsampled = Math.max(...result.values);

        expect(minDownsampled).toBeGreaterThanOrEqual(minOriginal - 2);
        expect(maxDownsampled).toBeLessThanOrEqual(maxOriginal + 2);
      });
    });

    describe("boundary conditions", () => {
      it("should handle targetCount equal to data length", () => {
        const values = [1, 2, 3, 4, 5];
        const timestamps = [10, 20, 30, 40, 50];

        const result = downsampleSignal(values, timestamps, 5);

        expect(result).toEqual({ values, timestamps });
      });

      it("should handle targetCount = 2", () => {
        const values = [1, 2, 3, 4, 5];
        const timestamps = [10, 20, 30, 40, 50];

        const result = downsampleSignal(values, timestamps, 2);

        expect(result.values.length).toBe(2);
        expect(result.values[0]).toBe(values[0]);
        expect(result.values[1]).toBe(values[values.length - 1]);
      });
    });
  });
});
