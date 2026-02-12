import { describe, expect, it } from 'vitest';
import { createShareTokenStore, InMemoryShareTokenStore } from '../../src/lib/shareTokens/store';

describe('Share token store', () => {
  it('creates token and resolves scenario id', async () => {
    const store = new InMemoryShareTokenStore();

    const token = await store.create({ userId: 'u1', scenarioId: 's1' });
    const resolved = await store.resolve({ token });

    expect(typeof token).toBe('string');
    expect(resolved?.scenarioId).toBe('s1');
    expect(resolved?.userId).toBe('u1');
  });

  it('defaults to in-memory store in local/test when external config missing', () => {
    const store = createShareTokenStore({ NODE_ENV: 'test' });
    expect(store).toBeInstanceOf(InMemoryShareTokenStore);
  });
});
