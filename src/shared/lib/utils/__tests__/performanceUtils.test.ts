import { calculateOptimalSampleCount } from "../performanceUtils";

describe("performanceUtils", () => {
  describe("calculateOptimalSampleCount", () => {
    it("should return minimum points for very small width", () => {
      const width = 50;
      const result = calculateOptimalSampleCount(width);

      expect(result).toBe(100);
    });

    it("should return minimum points when width is below threshold", () => {
      const width = 199;
      const result = calculateOptimalSampleCount(width);

      expect(result).toBe(100);
    });

    it("should calculate optimal count based on width", () => {
      const width = 400;
      const result = calculateOptimalSampleCount(width);

      expect(result).toBe(200);
    });

    it("should return maximum points for very large width", () => {
      const width = 20000;
      const result = calculateOptimalSampleCount(width);

      expect(result).toBe(5000);
    });

    it("should return maximum points when width exceeds threshold", () => {
      const width = 10001;
      const result = calculateOptimalSampleCount(width);

      expect(result).toBe(5000);
    });

    it("should calculate correctly for medium widths", () => {
      const width = 1000;
      const result = calculateOptimalSampleCount(width);

      expect(result).toBe(500);
    });

    it("should handle fractional results correctly", () => {
      const width = 333;
      const result = calculateOptimalSampleCount(width);

      expect(result).toBe(Math.floor(333 / 2));
      expect(result).toBeGreaterThanOrEqual(100);
      expect(result).toBeLessThanOrEqual(5000);
    });

    it("should return values within valid range", () => {
      const widths = [0, 50, 100, 500, 1000, 5000, 10000, 20000];

      widths.forEach((width) => {
        const result = calculateOptimalSampleCount(width);
        expect(result).toBeGreaterThanOrEqual(100);
        expect(result).toBeLessThanOrEqual(5000);
      });
    });

    it("should scale linearly for medium widths", () => {
      const width1 = 400;
      const width2 = 800;

      const result1 = calculateOptimalSampleCount(width1);
      const result2 = calculateOptimalSampleCount(width2);

      expect(result2).toBeGreaterThan(result1);
      expect(result2 / result1).toBeCloseTo(2, 0);
    });
  });
});
