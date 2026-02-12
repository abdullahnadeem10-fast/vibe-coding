import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// These imports will fail initially
import LandingPage from '../LandingPage';
import DemoPage from '../DemoPage';
import DashboardPage from '../DashboardPage';
import ScenarioPage from '../ScenarioPage';

describe('Gemini Design Variant Pages', () => {
    it('renders the Landing Page with distinctive branding', () => {
        render(<LandingPage />);
        expect(screen.getAllByText(/Future Wallet|FW/i).length).toBeGreaterThan(0);
        // Check for specific brutalist/bold elements
        expect(screen.getByRole('heading', { level: 1 })).toBeDefined();
    });

    it('renders the Demo Page with interactive elements', () => {
        render(<DemoPage />);
        expect(screen.getByText(/Simulation/i)).toBeDefined();
        // Check for at least one button
        expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
    });

    it('renders the Dashboard Page with metrics', () => {
        render(<DashboardPage />);
        expect(screen.getByText(/Net Worth|Assets/i)).toBeDefined();
    });

    it('renders the Scenario Page with detail view', () => {
        render(<ScenarioPage params={{ id: '123' }} />);
        expect(screen.getByText(/Scenario/i)).toBeDefined();
    });
});
