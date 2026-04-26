import { DEFAULT_WINDOW_SIZE } from '@/constants';
import {
  DataPoint,
  Aggregates,
  DownsampledPoint,
  ProcessDataResult,
} from '@/types';

/**
 * Calculates window aggregates and applies LTTB downsampling when needed.
 */
export function processData(
  data: DataPoint[],
  start: number,
  windowSize: number,
  targetPoints: number = DEFAULT_WINDOW_SIZE,
): ProcessDataResult {
  if (!data || data.length === 0 || windowSize === 0) {
    return {
      downsampledData: [],
      aggregates: { min: 0, max: 0, average: 0, variance: 0 },
    };
  }

  const end = Math.min(start + windowSize, data.length);
  if (start >= end) {
    return {
      downsampledData: [],
      aggregates: { min: 0, max: 0, average: 0, variance: 0 },
    };
  }

  const windowData = data.slice(start, end);
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  let sumSquared = 0;

  for (let i = 0; i < windowData.length; i++) {
    const y = windowData[i].y;
    min = Math.min(min, y);
    max = Math.max(max, y);
    sum += y;
    sumSquared += y * y;
  }

  const n = windowData.length;
  const average = sum / n;
  const variance = sumSquared / n - average * average;

  const aggregates: Aggregates = {
    min,
    max,
    average,
    variance,
  };

  const result: DownsampledPoint[] = [];

  if (windowData.length <= targetPoints) {
    return {
      downsampledData: windowData.map((point) => ({
        ...point,
        yMin: point.y,
        yMax: point.y,
      })),
      aggregates,
    };
  }

  result.push({
    ...windowData[0],
    yMin: windowData[0].y,
    yMax: windowData[0].y,
  });

  const bucketSize = (windowData.length - 2) / (targetPoints - 2);

  for (let i = 0; i < targetPoints - 2; i++) {
    const bucketStart = Math.floor(i * bucketSize) + 1;
    const bucketEnd = Math.floor((i + 1) * bucketSize) + 1;

    let yMin = Infinity;
    let yMax = -Infinity;

    let maxArea = -1;
    let maxAreaIndex = bucketStart;
    const prevPoint = result[result.length - 1];
    const nextBucketIndex = Math.min(
      Math.floor((i + 1) * bucketSize) + 1,
      windowData.length - 1,
    );

    for (let j = bucketStart; j < bucketEnd; j++) {
      const currPoint = windowData[j];
      yMin = Math.min(yMin, currPoint.y);
      yMax = Math.max(yMax, currPoint.y);

      const area = Math.abs(
        (prevPoint.x - windowData[nextBucketIndex].x) *
          (currPoint.y - prevPoint.y) -
          (prevPoint.x - currPoint.x) *
            (windowData[nextBucketIndex].y - prevPoint.y),
      );

      if (area > maxArea) {
        maxArea = area;
        maxAreaIndex = j;
      }
    }

    const selectedPoint = windowData[maxAreaIndex];
    result.push({
      ...selectedPoint,
      yMin,
      yMax,
    });
  }

  if (windowData.length > 0) {
    const lastPoint = windowData[windowData.length - 1];
    result.push({
      ...lastPoint,
      yMin: lastPoint.y,
      yMax: lastPoint.y,
    });
  }

  return {
    downsampledData: result,
    aggregates,
  };
}
