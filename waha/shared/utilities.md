---
title: Utilities & Helpers
type: feature
layer: shared
keywords:
  [
    utility,
    helper,
    RxJS,
    logging,
    promise,
    timeout,
    cache,
    paginator,
    date,
    time,
    file,
    ID,
    fetch,
    JID,
    phone,
    ACK,
    event,
    reactive,
    abort,
    byte,
  ]
---

# Utilities & Helpers

Shared utility modules used across the codebase. Covers RxJS streams, logging
configuration, async timing, caching, pagination, JID/phone normalization, and
more.

## Dependencies

**Tools / services needed:** None **Dependent features:** All features
(foundation layer) **Packages:** `rxjs`, `pino`, `pino-http`, `nestjs-pino`,
`lodash`, `ulid`, `undici`

## Files

### Core Utilities

| File                                   | Key Exports                                                                        | Role                                                         |
| -------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `src/utils/DefaultMap.ts`              | `DefaultMap<K,T>`                                                                  | Auto-creating map — factory generates value on first `get()` |
| `src/utils/logging.ts`                 | `getPinoLogLevel()`, `getPinoTransport()`, `getNestJSLogLevels()`, `LoggerBuilder` | Pino logging configuration for NestJS                        |
| `src/utils/promiseTimeout.ts`          | `promiseTimeout()`, `sleep()`, `waitUntil()`, `TimeoutError`                       | Async timing utilities                                       |
| `src/utils/Cache.ts`                   | `Cache`                                                                            | Simple in-memory cache                                       |
| `src/utils/Paginator.ts`               | `Paginator`                                                                        | Pagination helper for list operations                        |
| `src/utils/StatusTracker.ts`           | `StatusTracker`                                                                    | Status tracking utility                                      |
| `src/utils/SingleDelayedJobRunner.ts`  | `SingleDelayedJobRunner`                                                           | One-shot delayed job scheduler                               |
| `src/utils/SinglePeriodicJobRunner.ts` | `SinglePeriodicJobRunner`                                                          | Periodic job runner                                          |
| `src/utils/datehelper.ts`              | Date utilities                                                                     | Date formatting                                              |
| `src/utils/timehelper.ts`              | Time utilities                                                                     | Time operations                                              |
| `src/utils/files.ts`                   | `fileExists()`                                                                     | File system helpers                                          |
| `src/utils/ids.ts`                     | `generatePrefixedId()`                                                             | ID generation (ULID-style with prefix)                       |
| `src/utils/list.ts`                    | List utilities                                                                     | Array helpers                                                |
| `src/utils/pairs.ts`                   | `pairs()`                                                                          | Pair generation                                              |
| `src/utils/abortable.ts`               | Abortable utilities                                                                | AbortController helpers                                      |
| `src/utils/bytes.ts`                   | Byte conversion                                                                    | Size formatting                                              |
| `src/utils/fetch.ts`                   | `fetchBuffer()`                                                                    | HTTP fetch to Buffer via undici                              |
| `src/utils/wa.ts`                      | WhatsApp utilities                                                                 | WA-specific helpers                                          |
| `src/utils/events.ts`                  | `EventWildUnmask`                                                                  | Event wildcard expansion (`*` → all events)                  |
| `src/utils/tmpdir.ts`                  | Temp directory                                                                     | Temp file management                                         |

### Core-Specific Utilities

| File                                   | Role                                                                                                                                         |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/core/utils/acks.ts`               | ACK conversion utilities (`StatusToAck`, `AckToStatus`)                                                                                      |
| `src/core/utils/chrome.ts`             | Chrome/Puppeteer-related utilities                                                                                                           |
| `src/core/utils/convertors.ts`         | Message conversion helpers including `MessagesForRead()`                                                                                     |
| `src/core/utils/events.ts`             | Event utilities including `EventWildUnmask`                                                                                                  |
| `src/core/utils/ids.ts`                | Message ID parsing (`parseMessageIdSerialized`, `SerializeMessageKey`)                                                                       |
| `src/core/utils/jids.ts`               | JID utilities — `isJidGroup`, `isJidBroadcast`, `isJidNewsletter`, `isNullJid`, `toCusFormat`, `toJID`, `JidFilter` class, `IgnoreJidConfig` |
| `src/core/utils/mentions.all.ts`       | Mention resolution utilities                                                                                                                 |
| `src/core/utils/PhoneJidNormalizer.ts` | Phone number to JID normalization                                                                                                            |
| `src/core/utils/processes.ts`          | Process management utilities                                                                                                                 |
| `src/core/utils/pwa.ts`                | PWA-related utilities                                                                                                                        |
| `src/core/utils/reactive.ts`           | RxJS utilities including `DistinctAck`                                                                                                       |

### Subdirectories

| Directory             | Role                                                  |
| --------------------- | ----------------------------------------------------- |
| `src/utils/reactive/` | RxJS utilities — stream operators, observable helpers |
| `src/utils/logging/`  | Additional logging utilities                          |
| `src/utils/bull/`     | BullMQ queue utilities                                |

## Understanding

Utilities are organized by scope: `src/utils/` for general-purpose helpers used
anywhere, `src/core/utils/` for WhatsApp-specific utilities (JIDs, ACKs, phone
normalization). The `DefaultMap` is used extensively for lazy-initialized
collections (e.g., per-event observables). RxJS utilities in `reactive/` handle
stream deduplication, event masking, and observable composition. Async utilities
(`promiseTimeout`, `sleep`, `waitUntil`) are used throughout session lifecycle
management.
