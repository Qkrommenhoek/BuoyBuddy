import type { DirectionBucket } from '../lib/ndbcSeries';

function polarPoint(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function wedgePath(cx: number, cy: number, rOuter: number, startAngle: number, endAngle: number): string {
  if (rOuter <= 0.5) return '';
  const pStart = polarPoint(cx, cy, rOuter, startAngle);
  const pEnd = polarPoint(cx, cy, rOuter, endAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${cx} ${cy} L ${pStart.x} ${pStart.y} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${pEnd.x} ${pEnd.y} Z`;
}

function speedColor(speed: number | null, maxSpeed: number): string {
  if (speed == null || maxSpeed <= 0) return 'var(--border)';
  const t = Math.min(1, speed / maxSpeed);
  return `color-mix(in srgb, var(--accent) ${Math.round((1 - t) * 100)}%, var(--wave-accent) ${Math.round(t * 100)}%)`;
}

function WindRose({ buckets }: { buckets: DirectionBucket[] }) {
  const size = 220;
  const c = size / 2;
  const rOuter = size / 2 - 26;
  const maxCount = Math.max(1, ...buckets.map((b) => b.count));
  const maxSpeed = Math.max(0, ...buckets.map((b) => b.avgSpeed ?? 0));
  const sectorWidth = 360 / buckets.length;
  const gapDeg = Math.min(2, sectorWidth * 0.15);

  return (
    <div className="wind-rose">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <circle key={f} cx={c} cy={c} r={rOuter * f} fill="none" stroke="var(--border)" strokeWidth={1} />
        ))}
        {buckets.map((b) => {
          const r = rOuter * (b.count / maxCount);
          if (b.count === 0) return null;
          const start = b.midAngle - sectorWidth / 2 + gapDeg;
          const end = b.midAngle + sectorWidth / 2 - gapDeg;
          return (
            <path
              key={b.label}
              d={wedgePath(c, c, r, start, end)}
              fill={speedColor(b.avgSpeed, maxSpeed)}
            />
          );
        })}
        {['N', 'E', 'S', 'W'].map((label, i) => {
          const p = polarPoint(c, c, rOuter + 14, i * 90);
          return (
            <text key={label} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="var(--text)">
              {label}
            </text>
          );
        })}
      </svg>
      <div className="wind-rose-legend">Frequency by direction, colored by average speed</div>
    </div>
  );
}

export default WindRose;
