---
title: Share Links
type: feature
layer: api
keywords:
  [
    share link,
    pairing link,
    QR,
    pairing code,
    public link,
    HMAC token,
    dashboard widget,
    WAHA_SHARE_SECRET,
  ]
---

# Share Links

Hand someone a temporary public URL that lets them pair a session - scan the QR
code or request a pairing code - without giving them an API key or dashboard
access. The link closes as soon as the session is paired, and expires after 24h.

Fork-only feature, not part of upstream WAHA.

## Dependencies

**Tools / services needed:** none (node `crypto` only) **Dependent features:**
[[dashboard]], [[core-session-manager]], [[core-auth]] **Packages:** none added

## Files

| File                                    | Role                                                                                          | Likely to edit? |
| --------------------------------------- | --------------------------------------------------------------------------------------------- | --------------- |
| `src/core/share/ShareLinkService.ts`    | Signs / verifies tokens, TTL, in-memory set of closed links                                   | Sometimes       |
| `src/core/share/share.assets.ts`        | The public pairing page and the dashboard widget, as browser-ready strings                    | Often           |
| `src/api/share.controller.ts`           | `POST /api/sessions/:session/share-link` (API key) + the public `/share/*` routes             | Sometimes       |
| `src/structures/share.dto.ts`           | `ShareLink`, `ShareState`, `ShareRequestCodeRequest`                                          | Rarely          |
| `src/core/share/ShareLinkService.test.ts` | Token signing/expiry/tamper cases, plus a syntax check of the two browser scripts            | Sometimes       |
| `src/core/SwaggerConfiguratorCore.ts`   | Upstream file - `/share/` is in the swagger Basic Auth exclude list                           | No              |
| `src/core/app.module.core.ts`           | Upstream file - registers the two controllers and the service                                 | No              |
| `Dockerfile`                            | Upstream file - injects `<script src="/share/inject.js">` into the dashboard HTML             | No              |

## Understanding

**Tokens carry their own state.** A token is
`base64url({"s":<session>,"e":<expiryMs>}).base64url(HMAC-SHA256)`, signed with
`WAHA_SHARE_SECRET` (falling back to `WAHA_API_KEY`, then a per-process random
secret). Nothing is stored when a link is handed out, so links survive
restarts - and a forged one fails `timingSafeEqual` on the signature.

**Routes.** `POST /api/sessions/:session/share-link` sits behind the normal API
key + `CanSession(Action.Control)` policy and returns `{token, path, expiresAt}`.
Everything under `/share/` is deliberately public: `GET /share/:token` (the
page), `GET /share/:token/state` (status + QR as a data URL),
`POST /share/:token/start`, `POST /share/:token/request-code`. `/share/` had to
be added to the swagger Basic Auth exclude list in `SwaggerConfiguratorCore` -
that middleware is applied globally with `app.use()`, so without the exclusion
every visitor gets a Basic Auth prompt.

**Lifecycle.** The page polls `/state` every 3s. A `STOPPED` session is started
automatically (one `POST /start`), `SCAN_QR_CODE` renders the QR from the state
payload (no separate image endpoint, so no cache busting), and `WORKING` closes
the link server-side and shows the success screen. A closed or expired token
answers 410, a forged one 401.

**Dashboard button.** The dashboard is an upstream prebuilt Nuxt bundle, so the
"Get a Share Link" button is injected rather than patched in: the Dockerfile
appends a `<script src="/share/inject.js">` tag to the dashboard's HTML files,
and that script watches for `.p-dialog`, reads the session name from the first
`<span>` in `.p-dialog-title`, reads the server URL and API key from the
dashboard's own `localStorage['servers']`, and inserts the button after the
`Scan QR / Enter Code / Passkey` tab list. All of those anchors are upstream
dashboard details - if a dashboard bump moves them the button silently stops
appearing, which is the intended failure mode.

## Configuration

| Variable                      | Default             | Purpose                        |
| ----------------------------- | ------------------- | ------------------------------ |
| `WAHA_SHARE_SECRET`           | `WAHA_API_KEY`      | HMAC secret for link tokens    |
| `WAHA_SHARE_LINK_TTL_HOURS`   | `24`                | How long a new link stays valid |
