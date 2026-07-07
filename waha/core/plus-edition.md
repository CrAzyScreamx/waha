---
title: Multi-Session & Plus Edition
type: feature
layer: plus
keywords:
  [
    multi-session,
    plus,
    MongoDB,
    PostgreSQL,
    SQLite,
    external storage,
    persistence,
    session orchestration,
  ]
---

# Multi-Session & Plus Edition

Plus edition extends Core with multi-session orchestration, external storage
backends, and advanced media handling. Lives entirely under `src/plus` and must
not be imported from Core code.

## Dependencies

**Tools / services needed:** MongoDB, PostgreSQL, SQLite, Redis **Dependent
features:** [[core-session-manager]], [[core-media-storage]] **Packages:**
`mongodb`, `pg`, `sqlite3`, `better-sqlite3`, `knex`, `ioredis`,
`@liaoliaots/nestjs-redis`

## Files

| File        | Role                                            | Likely to edit? |
| ----------- | ----------------------------------------------- | --------------- |
| `src/plus/` | Plus-specific session manager, storage backends | Yes             |

## Understanding

`SessionManagerPlus` replaces `SessionManagerCore` when Plus is active, adding
support for multiple concurrent sessions with external persistence. Storage
backends (MongoDB, PostgreSQL, SQLite) store session state so it survives
restarts. Core code must never import from Plus — a pre-commit hook enforces
this by rejecting the word `plus` inside core files. Commit messages touching
`src/plus` require a `[PLUS]` prefix.
