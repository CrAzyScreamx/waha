---
title: Media & Storage
type: feature
layer: core
keywords:
  [
    media,
    storage,
    S3,
    local,
    upload,
    download,
    file,
    image,
    audio,
    video,
    document,
    converter,
    mimetype,
    atomic write,
    purge,
  ]
---

# Media & Storage

Centralized media handling through `MediaManager` and `MediaStorageFactory`.
Supports multiple storage backends (local filesystem, AWS S3) and provides
unified upload/download/view operations across all WhatsApp engines.

## Dependencies

**Tools / services needed:** Local filesystem or AWS S3, sharp (image
processing), audio-decode **Dependent features:** [[api-rest-api]],
[[core-engines]], [[core-session-manager]] **Packages:** `@aws-sdk/client-s3`,
`@aws-sdk/s3-request-presigner`, `sharp`, `audio-decode`, `file-type`,
`adm-zip`, `mime-types`

## Files

| File                                                 | Role                                                                                                                                                  | Likely to edit? |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `src/core/media/MediaManager.ts`                     | Orchestrates media download — checks mimetype filter, fetches via engine processor, saves to storage, with retry logic (5 retries)                    | Yes             |
| `src/core/media/MediaStorageFactory.ts`              | Abstract factory — `build(name, logger)` returns `IMediaStorage` implementation                                                                       | Sometimes       |
| `src/core/media/IMediaManager.ts`                    | Media processing interface — `processMedia<Message>()`, `close()`                                                                                     | Rarely          |
| `src/core/media/IMediaStorage.ts`                    | Storage abstraction — `init()`, `save()`, `exists()`, `getStorageData()`, `purge()`, `close()`. Defines `MediaData` and `MediaStorageData` interfaces | Rarely          |
| `src/core/media/IMediaEngineProcessor.ts`            | Engine-specific media extractor — `hasMedia()`, `getFilename()`, `getMimetype()`, `getMessageId()`, `getChatId()`, `getMediaBuffer()`                 | Sometimes       |
| `src/core/media/IConverter.ts`                       | Media conversion interface — `voice()`, `video()`. `CoreMediaConverter` throws `AvailableInPlusVersion` (Plus-only feature)                           | Rarely          |
| `src/core/media/WAMimeType.ts`                       | Enum — `VOICE = 'audio/ogg; codecs=opus'`, `VIDEO = 'video/mp4'`                                                                                      | Rarely          |
| `src/core/media/local/MediaLocalStorage.ts`          | Saves media to filesystem with atomic writes, auto-purge after configurable lifetime                                                                  | Sometimes       |
| `src/core/media/local/MediaLocalStorageConfig.ts`    | Configuration for local storage (folder path, lifetime)                                                                                               | Rarely          |
| `src/core/media/local/MediaLocalStorageFactory.ts`   | Factory for local storage backend                                                                                                                     | Rarely          |
| `src/core/media/local/media.local.storage.module.ts` | NestJS module for local media storage                                                                                                                 | Rarely          |

## Understanding

Media pipeline: `IMediaEngineProcessor` (engine-specific extraction) →
`MediaManager` (orchestration, mimetype filtering, retry) → `IMediaStorage`
(LOCAL/S3). Local storage uses atomic writes (write to temp, then rename) and
supports auto-purge after a configurable lifetime. S3 storage uses pre-signed
URLs for access. The `MediaStorageFactory` selects the backend based on
`WAHA_MEDIA_STORAGE` env var. Media files are normalized across engines so the
REST API returns consistent responses regardless of which WhatsApp backend is
active. Configuration via `WAHA_HTTP_FILES_FOLDER` for local path and
`WAHA_MEDIA_MIMETYPES` for filtering.
