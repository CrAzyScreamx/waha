---
title: REST API & Controllers
type: feature
layer: api
keywords:
  [
    REST,
    controllers,
    HTTP,
    endpoints,
    sessions,
    messaging,
    groups,
    contacts,
    media,
    presence,
    webhooks,
    WebSocket,
    gateway,
    authentication,
    CASL,
    API key,
  ]
---

# REST API & Controllers

Exposes the complete WhatsApp HTTP API surface through 25+ NestJS controllers
and a WebSocket gateway. All routes follow `/api/{sessionName}/…` and thread the
session name through guards and DTOs rather than hardcoding `default`.

## Dependencies

**Tools / services needed:** NestJS, Express, WebSocket (ws), Passport (API key
auth), CASL (authorization) **Dependent features:** [[core-session-manager]],
[[core-engines]], [[shared-dtos]], [[core-auth]] **Packages:** `@nestjs/common`,
`@nestjs/core`, `@nestjs/swagger`, `@nestjs/platform-ws`, `passport`,
`passport-headerapikey`, `@casl/ability`

## Files

| File                                 | Role                                                                                    | Likely to edit? |
| ------------------------------------ | --------------------------------------------------------------------------------------- | --------------- |
| `src/api/sessions.controller.ts`     | Session lifecycle CRUD (start, stop, status, restart, logout, unpair)                   | Yes             |
| `src/api/chatting.controller.ts`     | Send text, image, file, voice, video, location, poll, reaction, forward, buttons, lists | Yes             |
| `src/api/media.controller.ts`        | Upload, download, view media files; file serving endpoints                              | Sometimes       |
| `src/api/contacts.controller.ts`     | Contact lookup, vCard generation, check WhatsApp numbers, contact updates               | Sometimes       |
| `src/api/groups.controller.ts`       | Group CRUD, participant management, group settings, invites                             | Sometimes       |
| `src/api/events.controller.ts`       | Webhook configuration per session (add/remove/list webhooks)                            | Sometimes       |
| `src/api/auth.controller.ts`         | Authentication flows — QR code retrieval, pairing code generation                       | Sometimes       |
| `src/api/websocket.gateway.core.ts`  | WebSocket gateway — event fan-out to connected clients                                  | Rarely          |
| `src/api/apikeys.controller.ts`      | API key management (create, list, delete, toggle)                                       | Rarely          |
| `src/api/health.controller.ts`       | Health checks, readiness probes (uses @nestjs/terminus)                                 | Rarely          |
| `src/api/presence.controller.ts`     | Online/offline presence control, presence subscription                                  | Rarely          |
| `src/api/profile.controller.ts`      | Profile picture, display name, status (about) management                                | Rarely          |
| `src/api/channels.controller.ts`     | Broadcast channel/newsletter operations (create, search, send)                          | Rarely          |
| `src/api/calls.controller.ts`        | Call event handling and data                                                            | Rarely          |
| `src/api/labels.controller.ts`       | Chat label management (CRUD, associate with chats)                                      | Rarely          |
| `src/api/status.controller.ts`       | WhatsApp Status (stories) — send text/image/video/voice, delete                         | Rarely          |
| `src/api/chats.controller.ts`        | Chat operations — read messages, archive, pin, chat summary                             | Rarely          |
| `src/api/lids.controller.ts`         | Linked Device ID to phone number mapping (NOWEB-specific)                               | Rarely          |
| `src/api/screenshot.controller.ts`   | Browser screenshot capture (WEBJS/Puppeteer-specific)                                   | Rarely          |
| `src/api/server.controller.ts`       | Server-level operations (environment info, config)                                      | Rarely          |
| `src/api/server.debug.controller.ts` | Debug operations — browser traces                                                       | Rarely          |
| `src/api/ping.controller.ts`         | Ping/pong connectivity check (ignored by auto-logging)                                  | Rarely          |
| `src/api/version.controller.ts`      | Version info endpoint                                                                   | Rarely          |
| `src/sessions.examples.ts`           | Example payloads for Swagger documentation                                              | Rarely          |

## Understanding

Controllers are kept thin — they validate input via DTOs (class-validator),
resolve the target session through guards, and delegate to managers/services.
The session name is always extracted from the request path and threaded through
`SessionGuard` before reaching handlers. The WebSocket gateway (`/ws` path) fans
out engine events to connected clients in real time, with per-connection
authentication via `x-api-key` query parameter and CASL-based session scoping.
Swagger documentation is auto-generated via `@nestjs/swagger` decorators on all
controllers and DTOs.
