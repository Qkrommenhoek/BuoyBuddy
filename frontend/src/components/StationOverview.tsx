import { useEffect, useState } from 'react';
import { fetchStationConditions, ApiError, type NdbcRealtimeData } from '../api';
import { latestValue } from '../lib/ndbcSeries';
import Sparkline from './Sparkline';

interface PresetStation {
  id: string;
  label: string;
}

interface StationState {
  loading: boolean;
  error: string | null;
  data: NdbcRealtimeData | null;
}

function StationOverview({
  token,
  stations,
  onSelect,
  onAuthError,
}: {
  token: string;
  stations: PresetStation[];
  onSelect: (stationId: string) => void;
  onAuthError: () => void;
}) {
  const [states, setStates] = useState<Record<string, StationState>>({});

  useEffect(() => {
    let cancelled = false;
    setStates(Object.fromEntries(stations.map((s) => [s.id, { loading: true, error: null, data: null }])));

    Promise.all(
      stations.map((s) =>
        fetchStationConditions(token, s.id)
          .then((data) => ({ id: s.id, data, error: null as string | null }))
          .catch((err: unknown) => {
            if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
              onAuthError();
            }
            return {
              id: s.id,
              data: null as NdbcRealtimeData | null,
              error: err instanceof ApiError ? err.message : 'Unavailable',
            };
          }),
      ),
    ).then((results) => {
      if (cancelled) return;
      setStates((prev) => {
        const next = { ...prev };
        for (const r of results) next[r.id] = { loading: false, error: r.error, data: r.data };
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
    // stations is a stable module-level constant; onSelect/onAuthError intentionally excluded to avoid refetch loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, stations]);

  return (
    <div className="comparison-grid">
      {stations.map((s) => {
        const state = states[s.id];
        const wvht = state?.data ? latestValue(state.data, 'WVHT') : null;
        return (
          <button key={s.id} type="button" className="comparison-card" onClick={() => onSelect(s.id)}>
            <div className="comparison-card-header">
              <span className="comparison-card-name">{s.label}</span>
              <span className="comparison-card-id">#{s.id}</span>
            </div>
            {state?.loading && <div className="comparison-card-status">Loading…</div>}
            {state?.error && <div className="comparison-card-status comparison-card-error">{state.error}</div>}
            {state?.data && (
              <>
                <div className="comparison-card-value">
                  {wvht?.value ?? '—'}
                  {wvht?.value && <span className="metric-unit">{wvht.unit}</span>}
                  <span className="comparison-card-label">wave height</span>
                </div>
                <Sparkline data={state.data} metricKey="WVHT" days={7} />
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default StationOverview;
