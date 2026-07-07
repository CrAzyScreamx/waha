---
title: Docker & Infrastructure
type: feature
layer: infrastructure
keywords:
  [
    Docker,
    docker-compose,
    deployment,
    container,
    Makefile,
    entrypoint,
    environment,
    multi-worker,
    Minio,
    S3,
    MongoDB,
    ChatWoot,
    n8n,
  ]
---

# Docker & Infrastructure

Docker-based deployment configuration, compose files, and runtime entrypoint
scripts. Supports Core and Plus editions with optional media storage and
external database connections.

## Dependencies

**Tools / services needed:** Docker, Docker Compose **Dependent features:** All
features (deployment wrapper) **Packages:** N/A

## Files

### Docker

| File            | Role                                                                                                                       | Likely to edit? |
| --------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `Dockerfile`    | Multi-stage Docker build — installs dependencies, builds TypeScript, copies dashboard files                                | Sometimes       |
| `entrypoint.sh` | Container entrypoint script — handles runtime configuration, engine selection, API key setup, media storage initialization | Sometimes       |
| `.dockerignore` | Excludes unnecessary files from Docker build context                                                                       | Rarely          |
| `.env.example`  | Environment variable template with all supported `WAHA_*` and `WHATSAPP_*` vars                                            | Sometimes       |

### Docker Compose

| File                                         | Role                                                                                                                                                                      | Likely to edit? |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `docker-compose.yaml`                        | Single-service compose config — runs WAHA with optional volume mounts for media                                                                                           | Sometimes       |
| `docker-compose/docker-compose.workers.yaml` | Multi-worker setup — `waha-dashboard`, `waha1`, `waha2`, MongoDB, Minio (S3). Each worker has unique `WAHA_WORKER_ID`, `WAHA_BASE_URL`, shared MongoDB, shared S3 storage | Sometimes       |
| `docker-compose/chatwoot/`                   | ChatWoot integration compose — `.chatwoot.env`, `.waha.env`, `docker-compose.yaml` for full ChatWoot + WAHA stack                                                         | Sometimes       |
| `docker-compose/n8n/`                        | n8n automation compose — `docker-compose.yaml` for WAHA + n8n workflow automation                                                                                         | Sometimes       |
| `docker-compose/test/`                       | Test environment compose — `docker-compose.yaml` for running tests in containers                                                                                          | Rarely          |

### Build & Dev

| File                  | Role                                                                               | Likely to edit? |
| --------------------- | ---------------------------------------------------------------------------------- | --------------- |
| `Makefile`            | Development convenience commands — build, test, lint, docker operations            | Rarely          |
| `nest-cli.json`       | NestJS CLI configuration — build options, path aliases                             | Rarely          |
| `tsconfig.json`       | TypeScript configuration — path aliases (`@waha/*` → `src/*`), compilation options | Rarely          |
| `tsconfig.build.json` | Build-specific TypeScript config                                                   | Rarely          |

## Understanding

The Dockerfile uses multi-stage builds: first stage installs dependencies and
compiles TypeScript, second stage copies only the compiled output and production
dependencies. The entrypoint script handles runtime configuration — it can set
the default engine, configure API keys, and initialize media storage. Compose
files provide ready-to-run configurations for different deployment scenarios:
single-service, multi-worker with shared state, ChatWoot integration, and n8n
automation. Environment variables follow `WAHA_*` prefix for global settings and
`WHATSAPP_*` for engine-specific settings.
