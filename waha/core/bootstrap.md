---
title: Application Bootstrap & Module Wiring
type: feature
layer: core
keywords:
  [
    bootstrap,
    main,
    AppModule,
    NestJS,
    module,
    provider,
    middleware,
    Swagger,
    HTTPS,
    WebSocket,
    adapter,
    interceptor,
    filter,
  ]
---

# Application Bootstrap & Module Wiring

Entry point (`main.ts`) and core NestJS module (`app.module.core.ts`) that wire
all services, controllers, guards, and middleware together.

## Dependencies

**Tools / services needed:** None **Dependent features:** All features
(orchestration layer) **Packages:** `@nestjs/core`, `@nestjs/common`,
`@nestjs/platform-ws`, `@nestjs/swagger`, `reflect-metadata`

## Files

| File                          | Role                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Likely to edit? |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------- |
| `src/main.ts`                 | Runtime entry point (114 lines). Bootstrap sequence: (1) Sets global undici dispatcher to IPv4-only, (2) Sets up uncaught exception/rejection handlers with Pino logging, (3) Sets up SIGINT/SIGTERM handlers, (4) `loadModules()` — loads ESM modules via `vendor/esm.ts`, then dynamically imports `AppModuleCore` or `AppModulePlus` based on version, (5) Creates NestJS app with HTTPS options, global interceptors/filters, (6) Enables CORS, sets 50MB body limit for media, (7) Sets `WsAdapter` for WebSocket support, (8) Configures Swagger via `SwaggerConfiguratorCore`, (9) Calls `AppModule.appReady()` for HTTPS cert watching, (10) Enables shutdown hooks, (11) Listens on configured port | Sometimes       |
| `src/core/app.module.core.ts` | Core NestJS module (265 lines). Wires everything: imports (LoggerModule with auto-logging ignore for `/ping`, `/dashboard/`, `/api/files/`, `/api/s3/`, `/jobs/`; ConfigModule with Joi validation; ServeStaticModule for dashboard; MediaLocalStorageModule; PassportModule; TerminusModule; app controllers). Providers: `SessionManager` → `SessionManagerCore`, `WAHAHealthCheckService` → `WAHAHealthCheckServiceCore`, all config services, `WebsocketGatewayCore`, auth providers. Middleware: `ApiKeyAuthMiddleware` on `/api` and `/health`, `BasicAuthFunction` on `/dashboard`                                                                                                                    | Sometimes       |
| `src/version.ts`              | Version detection — checks `WAHA_VERSION` env var first, then checks if `src/plus/` directory exists, defaults to `WAHAVersion.CORE`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Rarely          |
| `src/vendor/esm.ts`           | Centralized ESM module loader — NestJS runs in CommonJS mode but Baileys is ESM-only. Uses dynamic `import()` to load `@adiwajshing/baileys` once and caches it. Called from `main.ts` before bootstrap                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Rarely          |
| `src/helpers.ts`              | General helper functions                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Rarely          |
| `src/nestjs/`                 | NestJS-specific utilities and adapters                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Rarely          |

## Understanding

The bootstrap is designed for flexibility: version detection (`src/version.ts`)
determines whether to load Core or Plus, then dynamically imports the
appropriate AppModule. The ESM bridge (`vendor/esm.ts`) must run before any
Baileys code loads, so it's called first in `loadModules()`. Global interceptors
handle logging, validation, and error formatting. The 50MB body limit supports
large media uploads. Shutdown hooks ensure clean session teardown on
SIGINT/SIGTERM.
