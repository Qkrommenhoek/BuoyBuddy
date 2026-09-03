import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { toSeries } from '../lib/ndbcSeries';
import type { NdbcRealtimeData } from '../api';

function Sparkline({
  data,
  metricKey,
  days = 7,
}: {
  data: NdbcRealtimeData;
  metricKey: string;
  days?: number;
}) {
  const series = toSeries(data, metricKey, days);
  if (series.length < 2) return null;

  return (
    <div className="sparkline">
      <ResponsiveContainer width="100%" height={28}>
        <LineChart data={series} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--accent)"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default Sparkline;
