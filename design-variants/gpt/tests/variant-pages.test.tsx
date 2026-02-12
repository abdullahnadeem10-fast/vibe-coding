import React from 'react';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

import LandingPage from '../landing/page';
import DemoPage from '../demo/page';
import DashboardPage from '../dashboard/page';
import ScenarioDetailPage from '../scenario/[id]/page';

describe('GPT design variant page integrity', () => {
  it('renders landing page with primary heading and CTA labels', () => {
    const html = renderToStaticMarkup(<LandingPage />);

    expect(html).toContain('Future Wallet');
    expect(html).toContain('Start Planning');
    expect(html).toContain('Run Live Demo');
  });

  it('renders demo page with simulation controls and output labels', () => {
    const html = renderToStaticMarkup(<DemoPage />);

    expect(html).toContain('Live Simulation Console');
    expect(html).toContain('Horizon');
    expect(html).toContain('Projected Net Worth');
  });

  it('renders dashboard page with portfolio and risk widgets', () => {
    const html = renderToStaticMarkup(<DashboardPage />);

    expect(html).toContain('Command Dashboard');
    expect(html).toContain('Portfolio Mix');
    expect(html).toContain('Risk Radar');
  });

  it('renders scenario detail page with scenario id and branch actions', () => {
    const html = renderToStaticMarkup(<ScenarioDetailPage params={{ id: 'alpha-42' }} />);

    expect(html).toContain('Scenario alpha-42');
    expect(html).toContain('Branch Scenario');
    expect(html).toContain('Compare Branches');
  });
});
