export interface TrailMetadata {
  id: string;
  title: string;
  subtitle: string;
  from: { id: string; name: string; templeNumber?: number };
  to: { id: string; name: string; templeNumber?: number };
  distanceM: number;
  ascentM: number;
  descentM: number;
  minElevationM: number;
  maxElevationM: number;
  sourceAttribution: string;
  dataLicense: string;
}
