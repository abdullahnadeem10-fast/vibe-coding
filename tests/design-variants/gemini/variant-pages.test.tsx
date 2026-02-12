import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import React from 'react';

// Using alias or relative paths
import LandingPage from '@/design-variants/gemini/LandingPage';
import DemoPage from '@/design-variants/gemini/DemoPage';
import DashboardPage from '@/design-variants/gemini/DashboardPage';
import ScenarioPage from '@/design-variants/gemini/ScenarioPage';

describe('Gemini Design Variant Pages', () => {
    it('renders the Landing Page with distinctive branding', () => {
        render(<LandingPage />);
        // Checking for some placeholder text that I will add
        expect(screen.getByText(/Future Wallet/i)).toBeDefined();
    });

    it('renders the Demo Page', () => {
        render(<DemoPage />);
        expect(screen.getByText(/Demo Skeleton/i)).toBeDefined();
    });

    it('renders the Dashboard Page', () => {
        render(<DashboardPage />);
        expect(screen.getByText(/Dashboard Skeleton/i)).toBeDefined();
    });

    it('renders the Scenario Page', () => {
        render(<ScenarioPage params={{ id: '123' }} />);
        expect(screen.getByText(/Scenario Skeleton 123/i)).toBeDefined();
    });
});
