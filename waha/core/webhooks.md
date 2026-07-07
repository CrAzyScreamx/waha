---
title: Webhooks & Event Delivery
type: feature
layer: core
keywords:
  [
    webhook,
    event,
    delivery,
    retry,
    HMAC,
    SHA-512,
    custom headers,
    User-Agent,
    connection pooling,
    linear retry,
    exponential retry,
    constant retry,
  ]
---

# Webhooks & Event Delivery

Configurable webhook system that forwards WhatsApp events to external HTTP
endpoints. Supports per-session webhook configuration with retry policies, HMAC
signing, and custom headers.

## Dependencies

**Tools / services needed:** External HTTP endpoint to receive webhooks
**Dependent features:** [[core-session-manager]], [[api-rest-api]],
[[core-config]] **Packages:** `axios`, `axios-retry`, `agentkeepalive`

## Files

| File                                                 | Role                                                                                                                                                                                                      | Likely to edit? |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `src/core/integrations/webhooks/WebhookConductor.ts` | `WebhookConductor` — configures webhook subscriptions per session. Subscribes to session event observables and forwards to `WebhookSender`                                                                | Sometimes       |
| `src/core/integrations/webhooks/WebhookSender.ts`    | `WebhookSender` — HTTP POST sender with retry logic (linear/exponential/constant policies), HMAC signing (SHA-512), custom headers, `User-Agent: WAHA/{version}`, connection pooling via `agentkeepalive` | Sometimes       |

## Understanding

Webhook flow: Session emits events via RxJS observables → `WebhookConductor`
subscribes and enriches payload with session info via `populateSessionInfo()` →
`WebhookSender` POSTs to configured URL with retry logic. Retry policies: linear
(fixed delay), exponential (backoff), constant (no backoff). HMAC signatures use
SHA-512 so receivers can verify authenticity. Connection pooling via
`agentkeepalive` reduces TCP handshake overhead for high-volume webhook
delivery. Global webhooks can be configured via env vars (`WHATSAPP_HOOK_URL`,
`WHATSAPP_HOOK_EVENTS`); per-session webhooks are managed through the REST API.
