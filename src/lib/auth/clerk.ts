export type EnvSource = Record<string, string | undefined>;

export interface AuthHeaderSource {
  get(name: string): string | null;
}

export function isClerkConfigured(env: EnvSource = process.env): boolean {
  return Boolean(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && env.CLERK_SECRET_KEY);
}

function isNonProduction(env: EnvSource): boolean {
  return env.NODE_ENV !== 'production';
}

async function tryResolveClerkUserId(): Promise<string | null> {
  try {
    const dynamicImport = new Function(
      'moduleName',
      'return import(moduleName)',
    ) as (moduleName: string) => Promise<Record<string, unknown>>;

    const clerkModule = await dynamicImport('@clerk/nextjs/server');
    const authFn = clerkModule.auth;

    if (typeof authFn !== 'function') return null;

    const authResult = await (authFn as () => Promise<{ userId?: string | null }>)();
    return authResult.userId ?? null;
  } catch {
    return null;
  }
}

export async function resolveAuthenticatedUserId(
  headersSource: AuthHeaderSource,
  env: EnvSource = process.env,
): Promise<string | null> {
  if (isClerkConfigured(env)) {
    const userId = await tryResolveClerkUserId();
    if (userId) return userId;
  }

  if (!isNonProduction(env)) {
    return null;
  }

  const headerUserId = headersSource.get('x-dev-user-id');
  if (headerUserId) return headerUserId;

  if (env.FUTURE_WALLET_DEV_USER_ID) {
    return env.FUTURE_WALLET_DEV_USER_ID;
  }

  return 'local-dev-user';
}