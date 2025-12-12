import type { SignalSeries } from "../../../domains/signal/model/types";

const NOT_FOUND_INDEX = -1;

interface DataPoint {
  x: number;
  y: number;
  index: number;
}

const MIN_TARGET_COUNT = 2;

export function sliceSignalByTimeWindow(
  series: SignalSeries,
  startSec: number,
  endSec: number
): SignalSeries | undefined {
  if (!hasTimestamps(series)) {
    return series;
  }

  const timestamps = series.timestamps!;
  const values = series.values;
  const startIndex = findStartIndex(timestamps, startSec);
  const endIndex = findEndIndex(timestamps, endSec);

  if (startIndex === NOT_FOUND_INDEX) {
    return undefined;
  }

  const lastIndex = endIndex === NOT_FOUND_INDEX ? timestamps.length : endIndex;

  return {
    ...series,
    timestamps: timestamps.slice(startIndex, lastIndex),
    values: values.slice(startIndex, lastIndex),
  };
}

function hasTimestamps(series: SignalSeries): series is SignalSeries & {
  timestamps: number[];
} {
  return !!series.timestamps && series.timestamps.length > 0;
}

function findStartIndex(timestamps: number[], startSec: number): number {
  return timestamps.findIndex((timestamp) => timestamp >= startSec);
}

function findEndIndex(timestamps: number[], endSec: number): number {
  return timestamps.findIndex((timestamp) => timestamp > endSec);
}

export function downsampleSignal(
  values: number[],
  timestamps: number[] | undefined,
  targetCount: number
): { values: number[]; timestamps: number[] | undefined } {
  if (shouldSkipDownsampling(values, targetCount)) {
    return { values, timestamps };
  }

  if (!hasValidTimestamps(timestamps, values)) {
    return downsampleWithoutTimestamps(values, targetCount);
  }

  return downsampleLTTB(values, timestamps!, targetCount);
}

function shouldSkipDownsampling(
  values: number[],
  targetCount: number
): boolean {
  return values.length <= targetCount || targetCount < MIN_TARGET_COUNT;
}

function hasValidTimestamps(
  timestamps: number[] | undefined,
  values: number[]
): timestamps is number[] {
  return !!timestamps && timestamps.length === values.length;
}

function downsampleWithoutTimestamps(
  values: number[],
  targetCount: number
): { values: number[]; timestamps: undefined } {
  const step = calculateStepSize(values.length, targetCount);
  const indices = calculateSampleIndices(values.length, targetCount, step);
  const uniqueIndices = deduplicateAndSort(indices);
  const downsampled = extractValuesByIndices(values, uniqueIndices);

  return { values: downsampled, timestamps: undefined };
}

function calculateStepSize(dataLength: number, targetCount: number): number {
  return dataLength / targetCount;
}

function calculateSampleIndices(
  dataLength: number,
  targetCount: number,
  step: number
): number[] {
  const indices: number[] = [];

  for (let i = 0; i < targetCount; i++) {
    const index = Math.round(i * step);
    indices.push(index);
  }

  indices.push(dataLength - 1);

  return indices;
}

function deduplicateAndSort(indices: number[]): number[] {
  return Array.from(new Set(indices)).sort((a, b) => a - b);
}

function extractValuesByIndices(values: number[], indices: number[]): number[] {
  return indices.map((index) => values[index]);
}

function downsampleLTTB(
  values: number[],
  timestamps: number[],
  targetCount: number
): { values: number[]; timestamps: number[] } {
  const dataLength = values.length;
  if (dataLength <= targetCount) {
    return { values, timestamps };
  }

  const dataPoints = createDataPoints(values, timestamps);
  const sampledPoints = performLTTBDownsampling(dataPoints, targetCount);

  return {
    values: sampledPoints.map((point) => point.y),
    timestamps: sampledPoints.map((point) => point.x),
  };
}

function createDataPoints(values: number[], timestamps: number[]): DataPoint[] {
  return values.map((y, index) => ({
    x: timestamps[index],
    y,
    index,
  }));
}

function performLTTBDownsampling(
  dataPoints: DataPoint[],
  targetCount: number
): DataPoint[] {
  const dataLength = dataPoints.length;
  const sampled: DataPoint[] = [dataPoints[0]];

  const bucketSize = calculateBucketSize(dataLength, targetCount);
  let previousSelectedIndex = 0;

  for (let bucketIndex = 0; bucketIndex < targetCount - 2; bucketIndex++) {
    const range = calculateBucketRange(bucketIndex, bucketSize, dataLength);
    const averagePoint = calculateAveragePoint(dataPoints, range);
    const selectedIndex = findLargestTrianglePoint(
      dataPoints,
      range,
      previousSelectedIndex,
      averagePoint
    );

    sampled.push(dataPoints[selectedIndex]);
    previousSelectedIndex = selectedIndex;
  }

  sampled.push(dataPoints[dataLength - 1]);

  return sampled;
}

function calculateBucketSize(dataLength: number, targetCount: number): number {
  return (dataLength - 2) / (targetCount - 2);
}

function calculateBucketRange(
  bucketIndex: number,
  bucketSize: number,
  dataLength: number
): { start: number; end: number } {
  const start = Math.floor((bucketIndex + 1) * bucketSize) + 1;
  const end = Math.min(
    Math.floor((bucketIndex + 2) * bucketSize) + 1,
    dataLength - 1
  );
  return { start, end };
}

function calculateAveragePoint(
  dataPoints: DataPoint[],
  range: { start: number; end: number }
): { x: number; y: number } {
  const bucketPoints = dataPoints.slice(range.start, range.end);
  const pointCount = bucketPoints.length;

  const avgX =
    bucketPoints.reduce((sum, point) => sum + point.x, 0) / pointCount;
  const avgY =
    bucketPoints.reduce((sum, point) => sum + point.y, 0) / pointCount;

  return { x: avgX, y: avgY };
}

function findLargestTrianglePoint(
  dataPoints: DataPoint[],
  range: { start: number; end: number },
  previousIndex: number,
  averagePoint: { x: number; y: number }
): number {
  let maxArea = -1;
  let selectedIndex = range.start;
  const previousPoint = dataPoints[previousIndex];

  for (let i = range.start; i < range.end; i++) {
    const currentPoint = dataPoints[i];
    const triangleArea = calculateTriangleArea(
      previousPoint,
      currentPoint,
      averagePoint
    );

    if (triangleArea > maxArea) {
      maxArea = triangleArea;
      selectedIndex = i;
    }
  }

  return selectedIndex;
}

function calculateTriangleArea(
  pointA: DataPoint,
  pointB: DataPoint,
  pointC: { x: number; y: number }
): number {
  return Math.abs(
    (pointA.x - pointC.x) * (pointB.y - pointA.y) -
      (pointA.x - pointB.x) * (pointC.y - pointA.y)
  );
}
