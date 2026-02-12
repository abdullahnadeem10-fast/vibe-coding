export interface ShareTokenRecord {
  token: string;
  userId: string;
  scenarioId: string;
  createdAt: string;
}

export interface CreateShareTokenPayload {
  userId: string;
  scenarioId: string;
}

export interface ResolveShareTokenPayload {
  token: string;
}

export interface ShareTokenStore {
  create(payload: CreateShareTokenPayload): Promise<string>;
  resolve(payload: ResolveShareTokenPayload): Promise<ShareTokenRecord | null>;
}

function createToken(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 20);
  }

  return `share_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

export class InMemoryShareTokenStore implements ShareTokenStore {
  private readonly records = new Map<string, ShareTokenRecord>();

  async create(payload: CreateShareTokenPayload): Promise<string> {
    const token = createToken();
    this.records.set(token, {
      token,
      userId: payload.userId,
      scenarioId: payload.scenarioId,
      createdAt: new Date().toISOString(),
    });
    return token;
  }

  async resolve(payload: ResolveShareTokenPayload): Promise<ShareTokenRecord | null> {
    return this.records.get(payload.token) ?? null;
  }
}

let singleton: InMemoryShareTokenStore | null = null;

export function createShareTokenStore(_env: Record<string, string | undefined> = process.env): ShareTokenStore {
  if (!singleton) {
    singleton = new InMemoryShareTokenStore();
  }

  return singleton;
}
