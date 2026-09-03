import type { NdbcRealtimeData } from '../api';

export interface SeriesPoint {
  time: Date;
  value: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Zips the YY/MM/DD/hh/mm columns with `key`'s column into an ascending
 * chronological series. NDBC realtime2 rows are newest-first, so this
 * reverses them. `days`, if given, trims to the trailing window.
 */
export function toSeries(data: NdbcRealtimeData, key: string, days?: number): SeriesPoint[] {
  const cols = data.data;
  const yy = cols.YY;
  const mo = cols.MM;
  const dd = cols.DD;
  const hh = cols.hh;
  const mm = cols.mm;
  const values = cols[key];
  if (!yy || !mo || !dd || !hh || !mm || !values) return [];

  const points: SeriesPoint[] = [];
  for (let i = 0; i < values.length; i++) {
    const raw = values[i];
    if (raw == null) continue;
    const value = Number(raw);
    const y = Number(yy[i]);
    const mo_ = Number(mo[i]);
    const d = Number(dd[i]);
    const h = Number(hh[i]);
    const mi = Number(mm[i]);
    if (![value, y, mo_, d, h, mi].every(Number.isFinite)) continue;
    points.push({ time: new Date(Date.UTC(y, mo_ - 1, d, h, mi)), value });
  }
  points.reverse();

  if (days != null && points.length > 0) {
    const cutoff = points[points.length - 1].time.getTime() - days * MS_PER_DAY;
    return points.filter((p) => p.time.getTime() >= cutoff);
  }
  return points;
}

export function latestValue(data: NdbcRealtimeData, key: string): { value: string | null; unit: string } {
  const colIndex = data.columns.indexOf(key);
  const value = data.data[key]?.[0] ?? null;
  const unit = colIndex >= 0 ? data.units[colIndex] : '';
  return { value, unit };
}

export interface DirectionBucket {
  label: string;
  midAngle: number;
  count: number;
  avgSpeed: number | null;
}

const SECTOR_LABELS_16 = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

/** Buckets a direction series (degrees) into compass sectors, optionally averaging a paired speed series. */
export function bucketByDirection(
  directions: SeriesPoint[],
  speeds: SeriesPoint[] = [],
  sectors = 16,
): DirectionBucket[] {
  const speedByTime = new Map<number, number>();
  for (const s of speeds) speedByTime.set(s.time.getTime(), s.value);

  const sectorWidth = 360 / sectors;
  const buckets: DirectionBucket[] = Array.from({ length: sectors }, (_, i) => ({
    label: sectors === 16 ? SECTOR_LABELS_16[i] : `${Math.round(sectorWidth * i)}°`,
    midAngle: sectorWidth * i,
    count: 0,
    avgSpeed: null,
  }));
  const speedSums = new Array(sectors).fill(0);
  const speedCounts = new Array(sectors).fill(0);

  for (const point of directions) {
    const deg = ((point.value % 360) + 360) % 360;
    const idx = Math.round(deg / sectorWidth) % sectors;
    buckets[idx].count += 1;
    const speed = speedByTime.get(point.time.getTime());
    if (speed != null) {
      speedSums[idx] += speed;
      speedCounts[idx] += 1;
    }
  }
  for (let i = 0; i < sectors; i++) {
    if (speedCounts[i] > 0) buckets[i].avgSpeed = speedSums[i] / speedCounts[i];
  }
  return buckets;
}
