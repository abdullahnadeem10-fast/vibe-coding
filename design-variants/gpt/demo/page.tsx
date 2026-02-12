import React from 'react';

const pageShell: React.CSSProperties = {
  minHeight: '100vh',
  padding: '2.5rem 1.4rem',
  background: 'linear-gradient(135deg, #1E1438 0%, #120D22 50%, #08070D 100%)',
  color: '#F8F3FF',
  fontFamily: 'Sora, Avenir Next, sans-serif',
};

const panel: React.CSSProperties = {
  maxWidth: '1120px',
  margin: '0 auto',
  border: '1px solid rgba(248, 243, 255, 0.2)',
  background: 'rgba(15, 10, 28, 0.74)',
  padding: '1.6rem',
  display: 'grid',
  gap: '1rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
};

const box: React.CSSProperties = {
  border: '1px solid rgba(248, 243, 255, 0.2)',
  padding: '1rem',
  background: 'rgba(8, 7, 15, 0.4)',
};

const buttonStyle: React.CSSProperties = {
  border: 'none',
  padding: '0.75rem 1rem',
  marginTop: '0.6rem',
  width: '100%',
  background: '#2AF2D0',
  color: '#021011',
  fontWeight: 700,
  fontFamily: 'IBM Plex Mono, monospace',
};

export default function DemoPageVariant() {
  return (
    <main style={pageShell}>
      <header style={{ maxWidth: '1120px', margin: '0 auto 1.3rem auto' }}>
        <p style={{ margin: 0, letterSpacing: '0.1em', fontFamily: 'IBM Plex Mono, monospace' }}>DEMO / SIMULATION PREVIEW</p>
        <h1 style={{ margin: '0.7rem 0 0 0', fontSize: 'clamp(2.2rem, 6vw, 4.1rem)' }}>Live Simulation Console</h1>
      </header>

      <section style={panel}>
        <article style={box}>
          <h2 style={{ marginTop: 0 }}>Inputs</h2>
          <p>Horizon: 365 days</p>
          <p>Cash reserve ratio: 18%</p>
          <p>Savings rate: 26%</p>
          <button type="button" style={buttonStyle}>Run Simulation</button>
        </article>

        <article style={box}>
          <h2 style={{ marginTop: 0 }}>Model Events</h2>
          <p>Income pulses monthly with deterministic taxes.</p>
          <p>Debt and investment nodes resolve via DAG order.</p>
          <p>Shocks activate on fixed timeline conditions.</p>
        </article>

        <article style={box}>
          <h2 style={{ marginTop: 0 }}>Projected Net Worth</h2>
          <p>Expected: $284,920</p>
          <p>P5 band: $244,100</p>
          <p>P95 band: $326,880</p>
        </article>
      </section>
    </main>
  );
}
