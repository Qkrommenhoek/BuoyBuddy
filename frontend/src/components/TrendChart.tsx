import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { toSeries } from '../lib/ndbcSeries';
import type { NdbcRealtimeData } from '../api';

interface MetricOption {
  key: string;
  label: string;
}

const METRIC_OPTIONS: MetricOption[] = [
  { key: 'WVHT', label: 'Wave height' },
  { key: 'WSPD', label: 'Wind speed' },
  { key: 'PRES', label: 'Pressure' },
  { key: 'WTMP', label: 'Water temp' },
];

const RANGE_OPTIONS: { label: string; days?: number }[] = [
  { label: '7d', days: 7 },
  { label: '14d', days: 14 },
  { label: '45d', days: undefined },
];

function formatTick(t: number): string {
  const d = new Date(t);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}`;
}

function formatTooltipLabel(t: number): string {
  return `${new Date(t).toUTCString().slice(0, -4)}UTC`;
}

function TrendChart({ data }: { data: NdbcRealtimeData }) {
  const [metricKey, setMetricKey] = useState(METRIC_OPTIONS[0].key);
  const [rangeIdx, setRangeIdx] = useState(0);

  const metricLabel = METRIC_OPTIONS.find((m) => m.key === metricKey)?.label ?? metricKey;

  const unit = useMemo(() => {
    const idx = data.columns.indexOf(metricKey);
    return idx >= 0 ? data.units[idx] : '';
  }, [data, metricKey]);

  const series = useMemo(() => {
    const days = RANGE_OPTIONS[rangeIdx].days;
    return toSeries(data, metricKey, days).map((p) => ({ t: p.time.getTime(), value: p.value }));
  }, [data, metricKey, rangeIdx]);

  return (
    <section className="trend-section">
      <div className="trend-controls">
        <div className="segmented">
          {METRIC_OPTIONS.map((m) => (
            <button
              key={m.key}
              type="button"
              className={`segmented-btn${m.key === metricKey ? ' segmented-active' : ''}`}
              onClick={() => setMetricKey(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="segmented">
          {RANGE_OPTIONS.map((r, i) => (
            <button
              key={r.label}
              type="button"
              className={`segmented-btn${i === rangeIdx ? ' segmented-active' : ''}`}
              onClick={() => setRangeIdx(i)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {series.length < 2 ? (
        <div className="trend-empty">No history available for this metric at this station.</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={series} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="t"
              type="number"
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatTick}
              tick={{ fontSize: 12, fill: 'var(--text)' }}
            />
            <YAxis width={40} tick={{ fontSize: 12, fill: 'var(--text)' }} unit={unit ? ` ${unit}` : ''} />
            <Tooltip
              labelFormatter={(t) => formatTooltipLabel(t as number)}
              formatter={(value) => [`${value} ${unit}`, metricLabel]}
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                color: 'var(--text-h)',
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#trendFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </section>
  );
}

export default TrendChart;
