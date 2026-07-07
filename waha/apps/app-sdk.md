---
title: App SDK & Pluggable Apps
type: feature
layer: apps
keywords:
  [
    App SDK,
    pluggable apps,
    BullMQ,
    queue,
    consumer,
    migration,
    runtime,
    definition,
    enable/disable,
  ]
---

# App SDK & Pluggable Apps

Framework for building pluggable apps on top of WAHA. Provides base consumer
classes, BullMQ utilities, migration runners, and a runtime system for app
lifecycle management.

## Dependencies

**Tools / services needed:** Redis (for BullMQ) **Dependent features:**
[[core-session-manager]], [[api-rest-api]] **Packages:** `bullmq`,
`@nestjs/bullmq`, `axios`

## Files

### Core SDK

| File                                   | Role                                                                                          | Likely to edit? |
| -------------------------------------- | --------------------------------------------------------------------------------------------- | --------------- |
| `src/apps/app_sdk/AppConsumer.ts`      | Base consumer class for BullMQ jobs — all app consumers extend this                           | Sometimes       |
| `src/apps/app_sdk/BullUtils.ts`        | BullMQ utilities including `RegisterAppQueue()` decorator                                     | Rarely          |
| `src/apps/app_sdk/constants.ts`        | Job constants — `JOB_DELAY`, `JOB_LOCK_TTL`, `JOB_CONCURRENCY`, retry options, remove options | Rarely          |
| `src/apps/app_sdk/AxiosLogging.ts`     | HTTP request/response logging for app API calls                                               | Rarely          |
| `src/apps/app_sdk/JobLoggerWrapper.ts` | Logger that bridges to BullMQ job logs                                                        | Rarely          |
| `src/apps/app_sdk/JobUtils.ts`         | Job utilities                                                                                 | Rarely          |
| `src/apps/app_sdk/migrations.ts`       | Migration runner for app database changes                                                     | Sometimes       |
| `src/apps/app_sdk/ILogger.ts`          | Logging interface for apps                                                                    | Rarely          |
| `src/apps/app_sdk/auth.ts`             | App authentication                                                                            | Rarely          |
| `src/apps/app_sdk/env.ts`              | App SDK environment variables                                                                 | Rarely          |

### App Runtime

| File                                  | Role                    | Likely to edit? |
| ------------------------------------- | ----------------------- | --------------- |
| `src/apps/app_sdk/apps/AppRuntime.ts` | App runtime environment | Sometimes       |
| `src/apps/app_sdk/apps/definition.ts` | App definition schema   | Sometimes       |
| `src/apps/app_sdk/apps/name.ts`       | App naming utilities    | Rarely          |

### Services & Storage

| File                                               | Role                         | Likely to edit? |
| -------------------------------------------------- | ---------------------------- | --------------- |
| `src/apps/app_sdk/services/IAppsService.ts`        | Apps service interface       | Rarely          |
| `src/apps/app_sdk/services/IAppService.ts`         | Single app service interface | Rarely          |
| `src/apps/app_sdk/services/AppsEnabledService.ts`  | Enabled apps management      | Sometimes       |
| `src/apps/app_sdk/services/AppsDisabledService.ts` | Disabled apps stub           | Rarely          |
| `src/apps/app_sdk/storage/AppRepository.ts`        | App persistence              | Sometimes       |
| `src/apps/app_sdk/storage/types.ts`                | Storage type definitions     | Rarely          |

### WAHA Adapters

| File                                 | Role                                                  | Likely to edit? |
| ------------------------------------ | ----------------------------------------------------- | --------------- |
| `src/apps/app_sdk/waha/WAHASelf.ts`  | Self-reference adapter for apps to interact with WAHA | Sometimes       |
| `src/apps/app_sdk/waha/Paginator.ts` | Pagination adapter for WAHA API responses             | Rarely          |

### Migrations

| File                                                     | Role                      | Likely to edit? |
| -------------------------------------------------------- | ------------------------- | --------------- |
| `src/apps/app_sdk/migrations/001_init_apps.ts`           | Initial apps table schema | Rarely          |
| `src/apps/app_sdk/migrations/002_add_enabled_to_apps.ts` | Adds enabled flag to apps | Rarely          |

### Module Files

| File                                      | Role                 | Likely to edit? |
| ----------------------------------------- | -------------------- | --------------- |
| `src/apps/app_sdk/api/apps.controller.ts` | Apps REST controller | Sometimes       |
| `src/apps/app_sdk/dto/app.dto.ts`         | App DTO              | Rarely          |
| `src/apps/app_sdk/dto/query.dto.ts`       | Query DTO            | Rarely          |
| `src/apps/app_sdk/jest/`                  | Test utilities       | Rarely          |

### Module Conditionals

| File                               | Role                                                     | Likely to edit? |
| ---------------------------------- | -------------------------------------------------------- | --------------- |
| `src/apps/apps.module.ts`          | Conditional module — imports enabled or disabled variant | Rarely          |
| `src/apps/apps.module.enabled.ts`  | Full app SDK with all features                           | Rarely          |
| `src/apps/apps.module.disabled.ts` | Stub module when apps are disabled                       | Rarely          |

## Understanding

The App SDK provides a framework where each "app" is a self-contained plugin
with its own consumers, migrations, and storage. Apps are registered and managed
through BullMQ queues. The `AppConsumer` base class handles job lifecycle
(acquire lock, execute, release lock, retry on failure). Migrations run on app
startup to ensure schema compatibility. Apps can be individually
enabled/disabled via the REST API.
