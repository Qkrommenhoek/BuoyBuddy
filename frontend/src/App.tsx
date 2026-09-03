import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchStationConditions, ApiError, type NdbcRealtimeData } from './api';
import { bucketByDirection, toSeries } from './lib/ndbcSeries';
import Sparkline from './components/Sparkline';
import TrendChart from './components/TrendChart';
import DirectionCompass from './components/DirectionCompass';
import WindRose from './components/WindRose';
import StationOverview from './components/StationOverview';
import './App.css';

const PRESET_STATIONS = [
  { id: '46239', label: 'Monterey Bay, CA' },
  { id: '46026', label: 'San Francisco, CA' },
  { id: '46042', label: 'Monterey, CA' },
  { id: '46013', label: 'Bodega Bay, CA' },
  { id: '44013', label: 'Boston Approach, MA' },
  { id: '51201', label: 'Waimea Bay, HI' },
];

interface Metric {
  key: string;
  label: string;
}

const METRICS: Metric[] = [
  { key: 'WVHT', label: 'Wave height' },
  { key: 'DPD', label: 'Dominant period' },
  { key: 'APD', label: 'Average period' },
  { key: 'MWD', label: 'Wave direction' },
  { key: 'WSPD', label: 'Wind speed' },
  { key: 'GST', label: 'Wind gust' },
  { key: 'WDIR', label: 'Wind direction' },
  { key: 'PRES', label: 'Pressure' },
  { key: 'ATMP', label: 'Air temp' },
  { key: 'WTMP', label: 'Water temp' },
  { key: 'DEWP', label: 'Dew point' },
  { key: 'VIS', label: 'Visibility' },
];

function readingTimestamp(data: NdbcRealtimeData): string | null {
  const at = (key: string) => data.data[key]?.[0];
  const [yy, mo, dd, hh, mm] = [at('YY'), at('MM'), at('DD'), at('hh'), at('mm')];
  if (!yy || !mo || !dd || !hh || !mm) return null;
  return `${mo}/${dd}/${yy} ${hh}:${mm} UTC`;
}

function numericLatest(data: NdbcRealtimeData, key: string): number | null {
  const raw = data.data[key]?.[0];
  if (raw == null) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function App({ token, onAuthError }: { token: string; onAuthError: () => void }) {
  const [tab, setTab] = useState<'station' | 'compare'>('station');
  const [stationInput, setStationInput] = useState('46239');
  const [stationId, setStationId] = useState('46239');
  const [conditions, setConditions] = useState<NdbcRealtimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    (id: string) => {
      setLoading(true);
      setError(null);
      fetchStationConditions(token, id)
        .then(setConditions)
        .catch((err: unknown) => {
          if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
            onAuthError();
            return;
          }
          setConditions(null);
          setError(err instanceof ApiError ? err.message : 'Could not reach the server.');
        })
        .finally(() => setLoading(false));
    },
    [token, onAuthError],
  );

  useEffect(() => {
    load(stationId);
  }, [stationId, load]);

  function handleStationSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = stationInput.trim();
    if (trimmed) setStationId(trimmed);
  }

  function selectStation(id: string) {
    setStationInput(id);
    setStationId(id);
    setTab('station');
  }

  const timestamp = conditions ? readingTimestamp(conditions) : null;
  const windDeg = conditions ? numericLatest(conditions, 'WDIR') : null;
  const waveDeg = conditions ? numericLatest(conditions, 'MWD') : null;

  const windRoseBuckets = useMemo(() => {
    if (!conditions) return null;
    const directions = toSeries(conditions, 'WDIR', 14);
    if (directions.length < 2) return null;
    const speeds = toSeries(conditions, 'WSPD', 14);
    return bucketByDirection(directions, speeds);
  }, [conditions]);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="brand">
          <svg className="wave-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M2 17c1.5 1.6 3 1.6 4.5 0s3-1.6 4.5 0 3 1.6 4.5 0 3-1.6 4.5 0" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12c1.5 1.6 3 1.6 4.5 0s3-1.6 4.5 0 3 1.6 4.5 0 3-1.6 4.5 0" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
            <circle cx="12" cy="6" r="2.4" />
          </svg>
          <span>BuoyBuddy</span>
        </div>
        <button type="button" className="btn btn-ghost" onClick={onAuthError}>
          Log out
        </button>
      </header>

      <main className="dashboard-main">
        <div className="segmented tab-bar">
          <button
            type="button"
            className={`segmented-btn${tab === 'station' ? ' segmented-active' : ''}`}
            onClick={() => setTab('station')}
          >
            Station
          </button>
          <button
            type="button"
            className={`segmented-btn${tab === 'compare' ? ' segmented-active' : ''}`}
            onClick={() => setTab('compare')}
          >
            Compare
          </button>
        </div>

        {tab === 'compare' ? (
          <StationOverview
            token={token}
            stations={PRESET_STATIONS}
            onSelect={selectStation}
            onAuthError={onAuthError}
          />
        ) : (
          <>
            <form className="station-picker" onSubmit={handleStationSubmit}>
              <div className="field">
                <label htmlFor="station">NDBC station ID</label>
                <input
                  id="station"
                  type="text"
                  value={stationInput}
                  onChange={(e) => setStationInput(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary">View conditions</button>
            </form>

            <div className="preset-chips">
              {PRESET_STATIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`chip${s.id === stationId ? ' chip-active' : ''}`}
                  onClick={() => selectStation(s.id)}
                >
                  {s.label} <span className="chip-id">#{s.id}</span>
                </button>
              ))}
            </div>

            {error && (
              <div className="alert alert-error" role="alert">
                {error}
                <button type="button" className="btn btn-ghost retry-btn" onClick={() => load(stationId)}>
                  Retry
                </button>
              </div>
            )}

            {loading && !error && <div className="loading-state">Loading station {stationId}…</div>}

            {!loading && !error && conditions && (
              <>
                <section className="conditions-card">
                  <div className="conditions-card-header">
                    <h2>Station {stationId}</h2>
                    {timestamp && <span className="timestamp">Observed {timestamp}</span>}
                  </div>
                  <div className="metrics-grid">
                    {METRICS.map((m) => {
                      const colIndex = conditions.columns.indexOf(m.key);
                      const value = conditions.data[m.key]?.[0] ?? null;
                      const unit = colIndex >= 0 ? conditions.units[colIndex] : '';
                      return (
                        <div className="metric-tile" key={m.key}>
                          <span className="metric-label">{m.label}</span>
                          <span className="metric-value">
                            {value ?? '—'}
                            {value && unit ? <span className="metric-unit">{unit}</span> : null}
                          </span>
                          <Sparkline data={conditions} metricKey={m.key} days={7} />
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section className="panel">
                  <h3>Trends</h3>
                  <TrendChart data={conditions} />
                </section>

                <section className="panel">
                  <h3>Directions</h3>
                  <div className="direction-section">
                    <DirectionCompass windDeg={windDeg} waveDeg={waveDeg} />
                    {windRoseBuckets ? (
                      <WindRose buckets={windRoseBuckets} />
                    ) : (
                      <div className="trend-empty">Not enough wind direction history for this station.</div>
                    )}
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
