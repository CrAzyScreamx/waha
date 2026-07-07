---
title: Storage & Repositories
type: feature
layer: core
keywords:
  [
    storage,
    repository,
    SQLite,
    SQL,
    JSON,
    local store,
    session auth,
    session config,
    API key,
    me info,
    worker,
    schema,
    Knex,
  ]
---

# Storage & Repositories

Abstract storage interfaces and implementations for session auth, session
config, API keys, user identity ("me" info), and worker assignment. Supports
local filesystem, SQLite3, and SQL backends via Knex.

## Dependencies

**Tools / services needed:** Filesystem, SQLite3, Knex query builder **Dependent
features:** [[core-session-manager]], [[core-auth]], [[plus-multi-session]]
**Packages:** `better-sqlite3`, `sqlite3`, `knex`, `fs-extra`,
`write-file-atomic`

## Files

### Repository Interfaces

| File                                           | Role                                                                                   | Likely to edit? |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- | --------------- |
| `src/core/storage/ISessionAuthRepository.ts`   | Session auth lifecycle — `init()`, `clean()`                                           | Rarely          |
| `src/core/storage/ISessionConfigRepository.ts` | Session config CRUD — `saveConfig()`, `getConfig()`, `deleteConfig()`, `listConfigs()` | Rarely          |
| `src/core/storage/ISessionMeRepository.ts`     | Stores "me" info (user's own WhatsApp identity)                                        | Rarely          |
| `src/core/storage/ISessionWorkerRepository.ts` | Worker assignment in multi-worker setups                                               | Rarely          |
| `src/core/storage/IApiKeyRepository.ts`        | API key management — `ApiKey` interface (id, key, isActive, isAdmin, session, rules)   | Rarely          |
| `src/core/storage/CoreApiKeyRepository.ts`     | Core implementation of `IApiKeyRepository`                                             | Sometimes       |

### Local Storage

| File                                               | Role                                                                                                                         | Likely to edit? |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `src/core/storage/LocalStore.ts`                   | Abstract base for file-based stores — `getBaseDirectory()`, `getEngineDirectory()`, `getSessionDirectory()`, `getFilePath()` | Rarely          |
| `src/core/storage/LocalStoreCore.ts`               | Core implementation of `LocalStore`                                                                                          | Rarely          |
| `src/core/storage/LocalSessionAuthRepository.ts`   | File-based session auth storage                                                                                              | Sometimes       |
| `src/core/storage/LocalSessionConfigRepository.ts` | File-based session config storage                                                                                            | Sometimes       |

### SQL/SQLite3

| File                                                         | Role                                                           | Likely to edit? |
| ------------------------------------------------------------ | -------------------------------------------------------------- | --------------- |
| `src/core/storage/Schema.ts`                                 | Generic schema definition — `Field`, `Index`, `Schema` classes | Rarely          |
| `src/core/storage/sql/IJsonQuery.ts`                         | JSON query interface for SQL databases                         | Rarely          |
| `src/core/storage/sql/schemas.ts`                            | Schema definitions for KV repositories                         | Rarely          |
| `src/core/storage/sql/SqlKVRepository.ts`                    | Generic SQL key-value repository                               | Rarely          |
| `src/core/storage/sqlite3/Sqlite3JsonQuery.ts`               | SQLite3-specific JSON query implementation                     | Rarely          |
| `src/core/storage/sqlite3/Sqlite3KVRepository.ts`            | SQLite3 key-value repository                                   | Rarely          |
| `src/core/storage/sqlite3/Sqlite3SessionMeRepository.ts`     | SQLite3 "me" info storage                                      | Rarely          |
| `src/core/storage/sqlite3/Sqlite3SessionWorkerRepository.ts` | SQLite3 worker assignment storage                              | Rarely          |

### DataStore

| File                        | Role                                                                                                                         | Likely to edit? |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `src/core/abc/DataStore.ts` | `abstract class DataStore` — base for storage backends with `init()`, `close()`, `getWAHADatabase()` (returns Knex instance) | Rarely          |

## Understanding

Storage follows a layered pattern: abstract interfaces define the contract, then
implementations handle the persistence mechanism. Local storage uses the
filesystem (with atomic writes via `write-file-atomic`). SQLite3 storage uses
Knex for query building and supports JSON columns for flexible data. The
`DataStore` abstract class is the entry point for storage backends — it
initializes the database connection and exposes a Knex instance. In Core
edition, SQLite3 stores API keys and session metadata; Plus edition adds MongoDB
and PostgreSQL backends.
