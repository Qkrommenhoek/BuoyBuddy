function polarPoint(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function DirectionCompass({ windDeg, waveDeg }: { windDeg: number | null; waveDeg: number | null }) {
  const size = 140;
  const c = size / 2;
  const r = size / 2 - 16;

  return (
    <div className="compass">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--border)" strokeWidth={1.5} />
        {['N', 'E', 'S', 'W'].map((label, i) => {
          const p = polarPoint(c, c, r + 12, i * 90);
          return (
            <text key={label} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="var(--text)">
              {label}
            </text>
          );
        })}
        {waveDeg != null && (
          <g transform={`rotate(${waveDeg} ${c} ${c})`}>
            <line x1={c} y1={c} x2={c} y2={c - r + 6} stroke="var(--wave-accent)" strokeWidth={3} strokeLinecap="round" strokeDasharray="1 4" />
          </g>
        )}
        {windDeg != null && (
          <g transform={`rotate(${windDeg} ${c} ${c})`}>
            <line x1={c} y1={c} x2={c} y2={c - r + 6} stroke="var(--accent)" strokeWidth={3} strokeLinecap="round" />
          </g>
        )}
        <circle cx={c} cy={c} r={3} fill="var(--text-h)" />
      </svg>
      <div className="compass-legend">
        <span><i className="legend-swatch legend-wind" />Wind {windDeg != null ? `${windDeg}°` : '—'}</span>
        <span><i className="legend-swatch legend-wave" />Wave {waveDeg != null ? `${waveDeg}°` : '—'}</span>
      </div>
    </div>
  );
}

export default DirectionCompass;
