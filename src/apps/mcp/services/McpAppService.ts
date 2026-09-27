import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { App } from '@waha/apps/app_sdk/dto/app.dto';
import { IAppService } from '@waha/apps/app_sdk/services/IAppService';
import { PluginOptions } from '@waha/core/abc/session.plugin';
import { AppRepository } from '@waha/apps/app_sdk/storage/AppRepository';
import { McpAppConfig } from '@waha/apps/mcp/dto/config.dto';
import { SessionManager } from '@waha/core/abc/manager.abc';
import { ApiKeyService } from '@waha/core/services/ApiKeyService';
import { WhatsappSession } from '@waha/core/abc/session.abc';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class McpAppService implements IAppService {
  constructor(
    @InjectPinoLogger('McpAppService')
    private readonly logger: PinoLogger,
  ) {}

  validate(app: App<McpAppConfig>): void {
    if (!app.config) {
      app.config = new McpAppConfig();
    }
    delete app.config.key_id;
    delete app.config.key;
    delete app.config.shared;
  }

  async beforeCreated(app: App<McpAppConfig>): Promise<void> {
    void app;
  }

  async afterCreated(
    manager: SessionManager,
    app: App<McpAppConfig>,
  ): Promise<void> {
    // share_key is a secret input - never persist it, even when linking fails
    const { share_key: shareKey, ...config } = app.config ?? ({} as any);
    const repo = new AppRepository(manager.store.getWAHADatabase());
    let updatedConfig = config as McpAppConfig;
    try {
      const keyDto = shareKey
        ? await this.linkSharedKey(manager, app, shareKey)
        : await new ApiKeyService(manager).createForApp(
            {
              isAdmin: false,
              session: app.session,
              isActive: true,
              actions: app.config?.actions ?? null,
            },
            app.id,
          );
      updatedConfig = {
        ...config,
        key_id: keyDto.id,
        ...(shareKey ? { shared: true } : {}),
      } as McpAppConfig;
    } finally {
      await repo.update(app.id, { config: updatedConfig });
      app.config = updatedConfig;
    }
  }

  private async linkSharedKey(
    manager: SessionManager,
    app: App<McpAppConfig>,
    shareKey: string,
  ) {
    // Holding the key value is the proof of access - a key_id alone is not enough
    const existing = await manager.apiKeyRepository.getByKey(shareKey);
    if (!existing) {
      throw new UnprocessableEntityException(
        'share_key does not match any API key',
      );
    }
    return new ApiKeyService(manager).linkForApp(
      existing.id,
      app.id,
      app.session,
      app.config?.actions ?? null,
    );
  }

  /** Keep server-managed fields from the saved app; drop the create-only input. */
  private pinConfig(
    savedApp: App<McpAppConfig>,
    newApp: App<McpAppConfig>,
  ): void {
    const { share_key: _ignored, ...config } = newApp.config ?? ({} as any);
    newApp.config = {
      ...config,
      key_id: savedApp.config?.key_id,
      ...(savedApp.config?.shared ? { shared: true } : {}),
    } as McpAppConfig;
  }

  async beforeEnabled(
    manager: SessionManager,
    savedApp: App<McpAppConfig>,
    newApp: App<McpAppConfig>,
  ): Promise<void> {
    await this.requireKeyExists(manager, savedApp);
    await this.syncKeyActions(manager, savedApp, newApp);
    await this.setKeyActive(manager, savedApp, true);
    this.pinConfig(savedApp, newApp);
  }

  async beforeDisabled(
    manager: SessionManager,
    savedApp: App<McpAppConfig>,
    newApp: App<McpAppConfig>,
  ): Promise<void> {
    await this.setKeyActive(manager, savedApp, false);
    this.pinConfig(savedApp, newApp);
  }

  async beforeUpdated(
    manager: SessionManager,
    savedApp: App<McpAppConfig>,
    newApp: App<McpAppConfig>,
  ): Promise<void> {
    await this.requireKeyExists(manager, savedApp);
    await this.syncKeyActions(manager, savedApp, newApp);
    this.pinConfig(savedApp, newApp);
  }

  async beforeDeleted(
    manager: SessionManager,
    app: App<McpAppConfig>,
  ): Promise<void> {
    await this.deleteKey(manager, app);
  }

  async beforeSessionDeleted(
    manager: SessionManager,
    app: App<McpAppConfig>,
  ): Promise<void> {
    await this.deleteKey(manager, app);
  }

  async purge(manager: SessionManager, app: App<McpAppConfig>): Promise<void> {
    void manager;
    void app;
  }

  async enrich(manager: SessionManager, app: App<McpAppConfig>): Promise<void> {
    const keyId = app.config?.key_id;
    if (!keyId) {
      return;
    }
    const keyDto = await new ApiKeyService(manager).getById(keyId);
    if (!keyDto) {
      return;
    }
    app.config = { ...(app.config ?? {}), key: keyDto.key } as McpAppConfig;
  }

  plugins(app: App<McpAppConfig>, session: WhatsappSession): PluginOptions[] {
    void app;
    void session;
    return [];
  }

  beforeSessionStart(app: App<McpAppConfig>, session: WhatsappSession): void {
    void app;
    void session;
  }

  afterSessionStart(app: App<McpAppConfig>, session: WhatsappSession): void {
    void app;
    void session;
  }

  private async requireKeyExists(
    manager: SessionManager,
    app: App<McpAppConfig>,
  ): Promise<void> {
    const keyId = app.config?.key_id;
    if (!keyId) {
      throw new UnprocessableEntityException(
        'MCP app has no associated API key. Delete this app and create a new one.',
      );
    }
    const existing = await new ApiKeyService(manager).getById(keyId);
    if (!existing) {
      throw new UnprocessableEntityException(
        `The API key for this MCP app no longer exists. Delete this app and create a new one.`,
      );
    }
  }

  private async syncKeyActions(
    manager: SessionManager,
    savedApp: App<McpAppConfig>,
    newApp: App<McpAppConfig>,
  ): Promise<void> {
    const keyId = savedApp.config?.key_id;
    if (!keyId) {
      return;
    }
    if (savedApp.config?.shared) {
      await new ApiKeyService(manager).updateLinkForApp(keyId, savedApp.id, {
        actions: newApp.config?.actions ?? null,
      });
      return;
    }
    await new ApiKeyService(manager).updateForApp(keyId, {
      actions: newApp.config?.actions ?? null,
    });
  }

  private async setKeyActive(
    manager: SessionManager,
    app: App<McpAppConfig>,
    isActive: boolean,
  ): Promise<void> {
    const keyId = app.config?.key_id;
    if (!keyId) {
      return;
    }
    if (app.config?.shared) {
      await new ApiKeyService(manager).updateLinkForApp(keyId, app.id, {
        isActive: isActive,
      });
      return;
    }
    await new ApiKeyService(manager).updateForApp(keyId, {
      isActive: isActive,
    });
  }

  private async deleteKey(
    manager: SessionManager,
    app: App<McpAppConfig>,
  ): Promise<void> {
    const keyId = app.config?.key_id;
    if (!keyId) {
      return;
    }
    if (app.config?.shared) {
      // The key belongs to another app - only drop this session from it
      await new ApiKeyService(manager).unlinkForApp(keyId, app.id);
      return;
    }
    await new ApiKeyService(manager).deleteForApp(keyId);
  }
}
