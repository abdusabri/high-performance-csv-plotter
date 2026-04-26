export interface DataPoint {
  x: number;
  y: number;
}

export interface Aggregates {
  min: number;
  max: number;
  average: number;
  variance: number;
}

export interface DownsampledPoint extends DataPoint {
  yMin: number;
  yMax: number;
}

export interface ProcessDataResult {
  downsampledData: DownsampledPoint[];
  aggregates: Aggregates;
}
