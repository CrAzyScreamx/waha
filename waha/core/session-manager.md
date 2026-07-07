---
title: Session Manager & Engine Bootstrap
type: feature
layer: core
keywords:
  [
    session,
    lifecycle,
    engine,
    WEBJS,
    NOWEB,
    GOWS,
    WPP,
    bootstrap,
    async-lock,
    concurrency,
    QR code,
    pairing,
    presence,
  ]
---

# Session Manager & Engine Bootstrap

Core session management and WhatsApp engine abstraction. Handles session
lifecycle (start, stop, restart, logout, unpair), engine selection, and the
async-lock-based concurrency model that prevents race conditions during session
operations.

## Dependencies

**Tools / services needed:** WhatsApp engine libraries (whatsapp-web.js,
Baileys, WPPConnect, GOWS/rust-bridge) **Dependent features:** [[api-rest-api]],
[[shared-dtos]], [[core-auth]], [[core-media-storage]] **Packages:**
`async-lock`, `whatsapp-web.js`, `@adiwajshing/baileys`,
`@wppconnect-team/wppconnect`, `whatsapp-rust-bridge`, `qrcode`,
`qrcode-terminal`, `node-cache`

## Files

| File                              | Role                                                                                                                                                                                                                                                                                                                                                                                                                 | Likely to edit? |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `src/core/manager.core.ts`        | `SessionManagerCore` — session lifecycle, engine creation, event observables                                                                                                                                                                                                                                                                                                                                         | Yes             |
| `src/core/abc/manager.abc.ts`     | `SessionManager` abstract class — start/stop/restart/logout/unpair, lock-based concurrency, `withLock()`, `populateSessionInfo()`, worker assignment                                                                                                                                                                                                                                                                 | Yes             |
| `src/core/abc/session.abc.ts`     | `WhatsappSession` abstract class (1258 lines) — defines all WhatsApp API methods (sendText, sendImage, sendFile, sendVoice, sendVideo, sendLocation, sendPoll, sendReaction, sendButtons, sendList, groups, contacts, presence, channels, status, chat operations). Includes `maintainPresenceOnline()` auto-presence management, profile picture caching (NodeCache, 24h TTL), sent message ID tracking (10min TTL) | Yes             |
| `src/core/abc/activity.ts`        | `@Activity()` decorator — marks engine methods that make network calls; triggers `maintainPresenceOnline()` before execution                                                                                                                                                                                                                                                                                         | Sometimes       |
| `src/core/abc/EngineBootstrap.ts` | `EngineBootstrap` interface (`bootstrap()`, `shutdown()`), `NoopEngineBootstrap` — used by GOWS for real subprocess bootstrap                                                                                                                                                                                                                                                                                        | Rarely          |
| `src/core/constants.ts`           | Engine names (`WAHAEngine` enum values), session constants                                                                                                                                                                                                                                                                                                                                                           | Rarely          |
| `src/core/QR.ts`                  | QR code generation and handling                                                                                                                                                                                                                                                                                                                                                                                      | Sometimes       |
| `src/core/vcard.ts`               | vCard parsing and generation for contact sharing                                                                                                                                                                                                                                                                                                                                                                     | Sometimes       |

## Understanding

`SessionManagerCore` orchestrates the session lifecycle — it creates engine
instances based on the configured engine type, manages async locks to serialize
start/stop operations, and exposes session event observables via RxJS
`SwitchObservable`. Each engine (WEBJS, NOWEB, GOWS, WPP) extends the abstract
`WhatsappSession` class and implements all abstract methods. Engine-specific
methods that aren't supported throw `NotImplementedByEngineError`. The
`@Activity()` decorator triggers `maintainPresenceOnline()` before engine
methods that make network calls, keeping sessions ONLINE during API activity and
scheduling an OFFLINE transition after an idle period. Session status flows
through observables that feed webhooks, WebSocket connections, and the session
controller.
