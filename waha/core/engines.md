---
title: WhatsApp Engines
type: feature
layer: core
keywords:
  [
    WEBJS,
    NOWEB,
    GOWS,
    WPP,
    Puppeteer,
    Baileys,
    gRPC,
    rust-bridge,
    engine,
    browser automation,
    WebSocket,
  ]
---

# WhatsApp Engines

Four engine implementations that extend `WhatsappSession`, each using a
different approach to communicate with WhatsApp servers. Engine-specific files
live under `src/core/engines/`.

## Dependencies

**Tools / services needed:** Varies by engine — Puppeteer (WEBJS), direct
WebSocket (NOWEB), Go subprocess + gRPC (GOWS), WPP Connect library (WPP)
**Dependent features:** [[core-session-manager]], [[core-media-storage]],
[[shared-dtos]] **Packages:** `puppeteer`, `@adiwajshing/baileys`,
`@wppconnect-team/wppconnect`, `whatsapp-rust-bridge`, `@grpc/grpc-js`,
`@grpc/proto-loader`

## Files

### WEBJS (Puppeteer-based browser automation)

| File                                           | Role                                                                                      | Likely to edit? |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------- |
| `src/core/engines/webjs/session.webjs.core.ts` | Main WEBJS session (2246 lines) — uses Puppeteer to run headless Chrome with WhatsApp Web | Yes             |
| `src/core/engines/webjs/WebjsClientCore.ts`    | WhatsApp Web.js client wrapper                                                            | Sometimes       |
| `src/core/engines/webjs/LocalAuth.ts`          | Local file-based authentication storage                                                   | Sometimes       |
| `src/core/engines/webjs/Puppeteer.ts`          | Browser process management                                                                | Sometimes       |
| `src/core/engines/webjs/WPage.ts`              | Page/tab management                                                                       | Sometimes       |
| `src/core/engines/webjs/presence.ts`           | Presence tracking via page tags                                                           | Rarely          |
| `src/core/engines/webjs/ack.webjs.ts`          | ACK event parsing from WhatsApp Web                                                       | Rarely          |
| `src/core/engines/webjs/groups.webjs.ts`       | Group event conversions                                                                   | Rarely          |

### NOWEB (Baileys — direct WebSocket to WhatsApp servers)

| File                                              | Role                                                                          | Likely to edit? |
| ------------------------------------------------- | ----------------------------------------------------------------------------- | --------------- |
| `src/core/engines/noweb/session.noweb.core.ts`    | Main NOWEB session (3002 lines) — uses Baileys library directly via WebSocket | Yes             |
| `src/core/engines/noweb/NowebAuthFactoryCore.ts`  | Auth state factory for Baileys                                                | Sometimes       |
| `src/core/engines/noweb/useMultiFileAuthState.ts` | Multi-file auth state persistence                                             | Sometimes       |
| `src/core/engines/noweb/PresenceProxy.ts`         | Presence management proxy                                                     | Sometimes       |
| `src/core/engines/noweb/store/`                   | In-memory store implementation for contacts, chats, messages                  | Sometimes       |
| `src/core/engines/noweb/noweb.buttons.ts`         | Interactive button message support                                            | Rarely          |
| `src/core/engines/noweb/noweb.newsletter.ts`      | Newsletter/channel support                                                    | Rarely          |
| `src/core/engines/noweb/labels/`                  | Label management for NOWEB                                                    | Rarely          |

### GOWS (Go subprocess via gRPC)

| File                                                 | Role                                                                      | Likely to edit? |
| ---------------------------------------------------- | ------------------------------------------------------------------------- | --------------- |
| `src/core/engines/gows/session.gows.core.ts`         | Main GOWS session (2722 lines) — communicates with Go subprocess via gRPC | Yes             |
| `src/core/engines/gows/GowsBootstrap.ts`             | Starts/stops the Go subprocess                                            | Sometimes       |
| `src/core/engines/gows/GowsSubprocess.ts`            | Subprocess lifecycle management                                           | Sometimes       |
| `src/core/engines/gows/GowsEventStreamObservable.ts` | Converts gRPC server stream to RxJS Observable                            | Sometimes       |
| `src/core/engines/gows/EventsFromObservable.ts`      | Extracts typed events from Observable stream                              | Rarely          |
| `src/core/engines/gows/grpc/`                        | gRPC proto definitions                                                    | Rarely          |
| `src/core/engines/gows/store/`                       | Auth storage for GOWS                                                     | Sometimes       |
| `src/core/engines/gows/pools.ts`                     | Connection pooling                                                        | Rarely          |
| `src/core/engines/gows/appstate.ts`                  | App state sync                                                            | Rarely          |

### WPP (WPP Connect)

| File                                       | Role                                                     | Likely to edit? |
| ------------------------------------------ | -------------------------------------------------------- | --------------- |
| `src/core/engines/wpp/session.wpp.core.ts` | Main WPP session (2578 lines) — uses WPP Connect library | Yes             |
| `src/core/engines/wpp/IWPPAuthManager.ts`  | Auth interface for WPP                                   | Sometimes       |
| `src/core/engines/wpp/WppConfig.ts`        | WPP configuration                                        | Sometimes       |
| `src/core/engines/wpp/WppTypes.ts`         | WPP-specific types                                       | Rarely          |
| `src/core/engines/wpp/events.wpp.ts`       | Event handling for WPP                                   | Sometimes       |
| `src/core/engines/wpp/reactive/`           | Reactive utilities for WPP                               | Rarely          |

### Shared

| File                        | Role                                                     | Likely to edit? |
| --------------------------- | -------------------------------------------------------- | --------------- |
| `src/core/engines/const.ts` | Shared constants — `Jid.BROADCAST = 'status@broadcast'`  | Rarely          |
| `src/core/engines/waproto/` | WhatsApp protocol utilities — `location.ts`, `vcards.ts` | Sometimes       |

## Understanding

Each engine takes a different approach: WEBJS automates a real Chrome browser
via Puppeteer (most compatible, heaviest resource usage); NOWEB speaks the
WhatsApp protocol directly via Baileys (lightweight, no browser needed); GOWS
delegates to a compiled Go binary via gRPC (fastest, requires Go binary); WPP
uses the WPP Connect library (another browser-based approach). All four extend
`WhatsappSession` and implement the same abstract interface, so the session
manager can swap backends transparently. Engine selection is controlled by
`WHATSAPP_DEFAULT_ENGINE` env var (defaults to `WEBJS`).
