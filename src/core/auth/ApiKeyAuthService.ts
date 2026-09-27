import { Injectable } from '@nestjs/common';
import { User } from '@waha/core/auth/apiKey.strategy';
import { SessionManager } from '@waha/core/abc/manager.abc';

@Injectable()
export class ApiKeyAuthService {
  constructor(private manager: SessionManager) {}

  async get(apikey: string): Promise<User | null> {
    if (!apikey) {
      return null;
    }
    const key = await this.manager.apiKeyRepository.getActiveByKey(apikey);
    if (!key) {
      return null;
    }
    const links = Object.values(key.links ?? {}).filter((l) => l.isActive);
    return {
      isAdmin: key.isAdmin,
      session: key.session,
      actions: key.actions,
      scopes: links.length
        ? [{ session: key.session, actions: key.actions }, ...links]
        : undefined,
    };
  }
}
