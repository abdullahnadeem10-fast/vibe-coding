import React from 'react';

const shell: React.CSSProperties = {
  minHeight: '100vh',
  padding: '2rem 1.25rem',
  background: 'conic-gradient(from 210deg at 25% 0%, #00161F, #031B18, #091A0C, #00161F)',
  color: '#ECFFF4',
  fontFamily: 'Archivo Black, Helvetica Neue, sans-serif',
};

const frame: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
};

const card: React.CSSProperties = {
  border: '1px solid rgba(236, 255, 244, 0.24)',
  padding: '1rem',
  background: 'rgba(0, 22, 17, 0.55)',
  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.3)',
};

export default function DashboardPageVariant() {
  return (
    <main style={shell}>
      <header style={{ maxWidth: '1200px', margin: '0 auto 1rem auto' }}>
        <p style={{ margin: 0, fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.1em' }}>APP / MAIN VIEW</p>
        <h1 style={{ margin: '0.4rem 0', fontSize: 'clamp(2.1rem, 5.5vw, 4rem)' }}>Command Dashboard</h1>
      </header>

      <section style={frame}>
        <article style={card}>
          <h2 style={{ marginTop: 0 }}>Net Worth Pulse</h2>
          <p>$192,440 current baseline</p>
          <p>+4.2% month over month</p>
        </article>

        <article style={card}>
          <h2 style={{ marginTop: 0 }}>Portfolio Mix</h2>
          <p>Cash 18% | Equity 52% | Bonds 21% | Alt 9%</p>
          <p>Rebalance target drift: 2.8%</p>
        </article>

        <article style={card}>
          <h2 style={{ marginTop: 0 }}>Risk Radar</h2>
          <p>Liquidity pressure: Low</p>
          <p>Debt stress index: Medium</p>
        </article>

        <article style={card}>
          <h2 style={{ marginTop: 0 }}>Upcoming Actions</h2>
          <p>April 08: Tax outflow trigger</p>
          <p>April 19: Mortgage prepayment window</p>
        </article>
      </section>
    </main>
  );
}
