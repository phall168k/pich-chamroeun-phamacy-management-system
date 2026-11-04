'use client';

import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState('Ready to check');
  const [checking, setChecking] = useState(false);
  async function checkApi() {
    setChecking(true);
    try {
      const response = await fetch('/api/health', { cache: 'no-store' });
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      setStatus(data.status === 'ok' ? 'API connected' : 'API unavailable');
    } catch {
      setStatus('API unavailable');
    } finally {
      setChecking(false);
    }
  }
  return (
    <main>
      <p className="eyebrow">PICH CHAMROEUN PHARMACY</p>
      <h1>Pharmacy management system</h1>
      <p>Your project foundation is ready. Start building inventory, sales, and pharmacy workflows.</p>
      <button onClick={checkApi} disabled={checking}>{checking ? 'Checking…' : 'Check API connection'}</button>
      <p role="status">{status}</p>
    </main>
  );
}
