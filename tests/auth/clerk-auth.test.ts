import { describe, expect, it } from 'vitest';
import {
  isClerkConfigured,
  resolveAuthenticatedUserId,
  type AuthHeaderSource,
} from '../../src/lib/auth/clerk';

describe('Clerk auth scaffold', () => {
  it('reports not configured when Clerk env vars are missing', () => {
    expect(isClerkConfigured({})).toBe(false);
    expect(
      isClerkConfigured({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
      }),
    ).toBe(false);
  });

  it('reports configured when both Clerk env vars exist', () => {
    expect(
      isClerkConfigured({
        NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_123',
        CLERK_SECRET_KEY: 'sk_test_123',
      }),
    ).toBe(true);
  });

  it('falls back to development user header when Clerk is not configured', async () => {
    const headers: AuthHeaderSource = {
      get(name: string) {
        if (name.toLowerCase() === 'x-dev-user-id') return 'dev-user-1';
        return null;
      },
    };

    await expect(resolveAuthenticatedUserId(headers, {})).resolves.toBe('dev-user-1');
  });

  it('does not allow header spoofing fallback in production', async () => {
    const headers: AuthHeaderSource = {
      get(name: string) {
        if (name.toLowerCase() === 'x-dev-user-id') return 'spoofed-user';
        return null;
      },
    };

    await expect(
      resolveAuthenticatedUserId(headers, {
        NODE_ENV: 'production',
      }),
    ).resolves.toBeNull();
  });

  it('does not allow env fallback user in production', async () => {
    const headers: AuthHeaderSource = {
      get() {
        return null;
      },
    };

    await expect(
      resolveAuthenticatedUserId(headers, {
        NODE_ENV: 'production',
        FUTURE_WALLET_DEV_USER_ID: 'dev-env-user',
      }),
    ).resolves.toBeNull();
  });
});