import React from 'react';

type ScenarioDetailPageProps = {
  params: {
    id: string;
  };
};

const shell: React.CSSProperties = {
  minHeight: '100vh',
  padding: '2.2rem 1.4rem',
  background: 'radial-gradient(circle at 80% 10%, #3A0813 0%, #13070A 40%, #070405 100%)',
  color: '#FFECEF',
  fontFamily: 'Fraunces, Georgia, serif',
};

const sectionStyle: React.CSSProperties = {
  maxWidth: '1080px',
  margin: '0 auto',
  border: '1px solid rgba(255, 236, 239, 0.24)',
  padding: '1.5rem',
  background: 'rgba(20, 8, 12, 0.64)',
};

const actionButton: React.CSSProperties = {
  border: '1px solid rgba(255, 236, 239, 0.34)',
  background: 'transparent',
  color: '#FFECEF',
  padding: '0.68rem 1rem',
  marginRight: '0.7rem',
  marginTop: '0.6rem',
  fontFamily: 'IBM Plex Mono, monospace',
};

export default function ScenarioDetailPageVariant({ params }: ScenarioDetailPageProps) {
  return (
    <main style={shell}>
      <section style={sectionStyle}>
        <p style={{ marginTop: 0, fontFamily: 'IBM Plex Mono, monospace', letterSpacing: '0.08em' }}>SCENARIO DETAIL / DETERMINISTIC TRACK</p>
        <h1 style={{ margin: '0.35rem 0 1rem 0', fontSize: 'clamp(2rem, 5.4vw, 3.5rem)' }}>Scenario {params.id}</h1>

        <p>Daily timeline resolves assets, debt, expenses, and shocks with strict topological execution and branch-safe snapshots.</p>

        <div>
          <button type="button" style={actionButton}>Branch Scenario</button>
          <button type="button" style={actionButton}>Compare Branches</button>
          <button type="button" style={actionButton}>Open Insights</button>
        </div>

        <div style={{ marginTop: '1.2rem', borderTop: '1px dashed rgba(255, 236, 239, 0.3)', paddingTop: '1rem', fontFamily: 'IBM Plex Mono, monospace' }}>
          <p>Current branch: BASELINE</p>
          <p>Last simulated day: 365 / 1,825</p>
          <p>Weekly checkpoints retained for export continuity.</p>
        </div>
      </section>
    </main>
  );
}
