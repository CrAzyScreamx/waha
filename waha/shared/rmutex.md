---
title: Distributed Redis Mutex
type: feature
layer: shared
keywords:
  [
    Redis,
    mutex,
    lock,
    distributed,
    rmutex,
    synchronization,
    worker,
    Lua script,
    TTL,
  ]
---

# Distributed Redis Mutex

A distributed Redis mutex module for cross-worker synchronization. Enables safe
concurrent access to shared resources when running multiple WAHA workers.

## Dependencies

**Tools / services needed:** Redis **Dependent features:**
[[core-session-manager]], [[plus-multi-session]] **Packages:** `ioredis`,
`@liaoliaots/nestjs-redis`

## Files

| File                                     | Role                                                                                                                                                  | Likely to edit? |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `src/modules/rmutex/types.ts`            | `RMutexClient`, `RMutex`, `RMutexLocked` interfaces — defines the mutex API (`acquireLock()`, `releaseLock()`, `extendLock()`, `lock()`, `withKey()`) | Rarely          |
| `src/modules/rmutex/RedisMutexClient.ts` | `RedisMutexClient` — Redis implementation using `SET NX PX` for acquire, Lua scripts for atomic unlock/extend                                         | Rarely          |
| `src/modules/rmutex/mutex.ts`            | `RMutexImpl`, `RMutexLockedImpl` — builder-pattern mutex, chains multiple keys, generates UUID lockId                                                 | Rarely          |
| `src/modules/rmutex/rmutex.service.ts`   | `RMutexService` — NestJS injectable service, `get(key, ttl)` returns `RMutex`                                                                         | Rarely          |
| `src/modules/rmutex/rmutex.module.ts`    | `RMutexModule` — NestJS module registration                                                                                                           | Rarely          |
| `src/modules/rmutex/index.ts`            | Barrel exports                                                                                                                                        | Rarely          |

## Understanding

Usage pattern: `rMutexService.get('key1').withKey('key2').lock()` — acquires
distributed lock on `key1-key2`. Uses `SET NX PX` for atomic lock acquisition
and Lua scripts for atomic unlock/extend operations. Supports lock extension
(renewing TTL without releasing) and multi-key locking (chaining keys for
composite lock names). Essential for multi-worker deployments where multiple
WAHA instances might try to manage the same session simultaneously.
