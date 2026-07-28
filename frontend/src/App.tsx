import { useEffect, useState } from 'react';

function App({ token, onAuthError }: { token: string; onAuthError: () => void }) {

  const [data, setData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://localhost:9000/api/ndbc/46239.txt', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          onAuthError();
          throw new Error('Session expired. Please log in again.');
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then(setData)
      .catch(err => setError(err.message));
  }, [token, onAuthError]);
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>Loading...</div>;
  return <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>{data}</div>;
}

export default App;
