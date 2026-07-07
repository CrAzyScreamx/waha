---
title: Configuration
type: feature
layer: core
keywords:
  [
    config,
    environment,
    env vars,
    WAHA_,
    engine config,
    dashboard config,
    swagger config,
    webhook config,
    proxy,
    worker,
    database,
  ]
---

# Configuration

Environment-driven configuration system with dedicated config services for each
subsystem. All settings use `WAHA_*` and `WHATSAPP_*` prefixes.

## Dependencies

**Tools / services needed:** None **Dependent features:** All features
(foundation layer) **Packages:** `@nestjs/config`, `joi`

## Files

### Main Config

| File                    | Role                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Likely to edit? |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `src/config.ts`         | Pure functions — `getEngineName()` (reads `WHATSAPP_DEFAULT_ENGINE`, defaults to `WEBJS`), `getNamespace()`, `getSessionNamespace()`                                                                                                                                                                                                                                                                                                                                                                    | Rarely          |
| `src/config.service.ts` | `WhatsappConfigService` (211 lines) — main injectable config service. Provides: server config (schema, hostname, port, baseUrl), worker config (workerId, autoStartDelaySeconds), media config (mimetypes, shouldDownloadMedia), session config (startSessions, shouldRestartAllSessions), proxy config, auth config (getApiKey, getExcludedPaths), health config, webhook config, database URLs (sessionMongoUrl, sessionPostgresUrl), debug mode, ignore config (status, groups, channels, broadcast) | Sometimes       |
| `src/core/env.ts`       | Environment variable definitions and validation                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Rarely          |

### Subsystem Config Services

| File                                            | Role                                                                                                                    | Likely to edit? |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------- |
| `src/core/config/EngineConfigService.ts`        | Reads `WHATSAPP_DEFAULT_ENGINE`, validates against `WAHAEngine` enum, defaults to WEBJS. Also handles `WAHA_PRINT_QR`   | Rarely          |
| `src/core/config/DashboardConfigServiceCore.ts` | Dashboard enable/disable (`WAHA_DASHBOARD_ENABLED`), credentials from `Auth` config                                     | Rarely          |
| `src/core/config/SwaggerConfigServiceCore.ts`   | Swagger enable/disable, credentials, title, description, external doc URL                                               | Rarely          |
| `src/core/config/GlobalWebhookConfig.ts`        | Parses global webhook config from env vars (`WHATSAPP_HOOK_URL`, `WHATSAPP_HOOK_EVENTS`, retries, HMAC, custom headers) | Rarely          |
| `src/core/config/WebJSEngineConfigService.ts`   | WebJS-specific engine configuration                                                                                     | Rarely          |
| `src/core/config/WPPEngineConfigService.ts`     | WPP-specific engine configuration                                                                                       | Rarely          |
| `src/core/config/GowsEngineConfigService.ts`    | GOWS bootstrap config (Go subprocess path, args)                                                                        | Rarely          |

## Understanding

Configuration is entirely environment-driven. `WhatsappConfigService` is the
central injectable service that all other services depend on for their settings.
Joi validation in `ConfigModule` ensures required variables are present and
valid. Per-session overrides are possible via `session.config.*` in the session
creation payload. The pattern is: env vars for global defaults → config service
parses and validates → services inject the config service → session-level
overrides apply on top.
