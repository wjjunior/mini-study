export function calculateOptimalSampleCount(width: number): number {
  const pixelsPerPoint = 2;
  const minPoints = 100;
  const maxPoints = 5000;

  const optimal = Math.floor(width / pixelsPerPoint);

  return Math.max(minPoints, Math.min(maxPoints, optimal));
}
