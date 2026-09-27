import { SessionActions } from '../auth/casl.types';

export interface ApiKey {
  id: string;
  key: string;
  isActive: boolean;
  isAdmin: boolean;
  session: string | null;
  actions: SessionActions | null;
  app_id?: string | null;
  // Extra sessions this key can access, keyed by the MCP app id that added them
  links?: Record<string, ApiKeyLink> | null;
}

export interface ApiKeyLink {
  session: string;
  actions: SessionActions | null;
  isActive: boolean;
}

export interface IApiKeyRepository {
  init(): Promise<void>;

  list(): Promise<ApiKey[]>;

  upsert(key: ApiKey): Promise<ApiKey>;

  getActiveByKey(key: string): Promise<ApiKey | null>;

  getById(id: string): Promise<ApiKey | null>;

  getByKey(key: string): Promise<ApiKey | null>;

  deleteById(id: string): Promise<void>;

  deleteBySession(session: string): Promise<void>;
}
