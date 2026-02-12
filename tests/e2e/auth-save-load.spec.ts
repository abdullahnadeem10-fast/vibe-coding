type PlaywrightTestScaffold = {
  describe(title: string, callback: () => void): void;
  skip(title: string, callback: () => Promise<void> | void): void;
};

declare const test: PlaywrightTestScaffold;

test.describe('Auth save/load', () => {
  test.skip('persists and reloads a scenario for an authenticated user', async () => {
    // Intentionally skipped scaffold until Playwright config and auth fixtures are wired.
  });
});