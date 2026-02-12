import React from 'react';

const shell: React.CSSProperties = {
  minHeight: '100vh',
  background: 'radial-gradient(circle at 20% 20%, #153A2A 0%, #091012 45%, #050607 100%)',
  color: '#F6F2E9',
  fontFamily: 'Bebas Neue, Oswald, sans-serif',
  padding: '3rem 2rem',
};

const glass: React.CSSProperties = {
  maxWidth: '1100px',
  margin: '0 auto',
  border: '1px solid rgba(246, 242, 233, 0.28)',
  background: 'linear-gradient(120deg, rgba(7, 18, 14, 0.84), rgba(10, 28, 21, 0.72))',
  boxShadow: '0 24px 80px rgba(0, 0, 0, 0.45)',
  padding: '2.5rem',
};

const statGrid: React.CSSProperties = {
  display: 'grid',
  gap: '0.9rem',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  marginTop: '2rem',
  fontFamily: 'IBM Plex Mono, monospace',
};

const statCard: React.CSSProperties = {
  border: '1px solid rgba(255, 255, 255, 0.16)',
  padding: '1rem',
  background: 'rgba(6, 12, 11, 0.58)',
};

const actionRow: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
  marginTop: '2rem',
};

const primaryAction: React.CSSProperties = {
  border: 'none',
  background: '#C2FF4D',
  color: '#06110C',
  padding: '0.9rem 1.25rem',
  fontFamily: 'IBM Plex Mono, monospace',
  fontWeight: 700,
  letterSpacing: '0.06em',
};

const ghostAction: React.CSSProperties = {
  border: '1px solid rgba(246, 242, 233, 0.3)',
  background: 'transparent',
  color: '#F6F2E9',
  padding: '0.9rem 1.25rem',
  fontFamily: 'IBM Plex Mono, monospace',
  fontWeight: 700,
  letterSpacing: '0.06em',
};

export default function LandingPageVariant() {
  return (
    <main style={shell}>
      <section style={glass}>
        <p style={{ margin: 0, fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.14em' }}>FINANCIAL OPERATING SYSTEM</p>
        <h1 style={{ fontSize: 'clamp(2.8rem, 8vw, 6rem)', lineHeight: 0.92, margin: '1rem 0' }}>
          Future Wallet
          <br />
          Engineered Certainty
        </h1>
        <p style={{ fontFamily: 'IBM Plex Mono, monospace', maxWidth: '52ch' }}>
          Project and branch your financial future with deterministic daily simulations, fast comparisons, and zero guesswork.
        </p>

        <div style={actionRow}>
          <button type="button" style={primaryAction}>Start Planning</button>
          <button type="button" style={ghostAction}>Run Live Demo</button>
        </div>

        <div style={statGrid}>
          <article style={statCard}>
            <p style={{ margin: 0, opacity: 0.78 }}>SIMULATION HORIZON</p>
            <strong style={{ fontSize: '1.3rem' }}>1,825 Days</strong>
          </article>
          <article style={statCard}>
            <p style={{ margin: 0, opacity: 0.78 }}>BRANCH COMPARISONS</p>
            <strong style={{ fontSize: '1.3rem' }}>Instant</strong>
          </article>
          <article style={statCard}>
            <p style={{ margin: 0, opacity: 0.78 }}>CLIENT-SIDE PRIVACY</p>
            <strong style={{ fontSize: '1.3rem' }}>By Default</strong>
          </article>
        </div>
      </section>
    </main>
  );
}
