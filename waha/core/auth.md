---
title: Authentication & Authorization
type: feature
layer: core
keywords:
  [
    authentication,
    authorization,
    API key,
    Passport,
    CASL,
    Basic Auth,
    HMAC,
    guard,
    middleware,
    policy,
    WebSocket auth,
    SHA-512,
  ]
---

# Authentication & Authorization

Multi-layered auth system: API key validation via Passport strategies,
CASL-based authorization for session scoping, and HTTP Basic Auth for
dashboard/Swagger protection.

## Dependencies

**Tools / services needed:** None (pure middleware) **Dependent features:**
[[api-rest-api]], [[core-storage]], [[core-config]] **Packages:** `passport`,
`passport-headerapikey`, `@casl/ability`

## Files

| File                                       | Role                                                                                                                                                                                                       | Likely to edit? |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `src/core/auth/auth.ts`                    | Core auth abstractions — `IApiKeyAuth` interface, `NoAuth`, `PlainApiKeyAuth`, `HashAuth`, `compare()` with timing-safe SHA-512 comparison                                                                 | Rarely          |
| `src/core/auth/config.ts`                  | `AuthConfig`, `Auth` singleton — reads `WAHA_API_KEY`, `WAHA_DASHBOARD_USERNAME/PASSWORD`, `WHATSAPP_SWAGGER_USERNAME/PASSWORD` from env. Auto-generates random credentials if common/weak values detected | Rarely          |
| `src/core/auth/apiKey.strategy.ts`         | `ApiKeyStrategy` (Passport) — `HeaderAPIKeyStrategy` reads `X-Api-Key` header, validates against admin key or session-specific keys                                                                        | Rarely          |
| `src/core/auth/api-key-auth.guard.ts`      | `ApiKeyAuthGuard` — NestJS guard wrapping the Passport strategy                                                                                                                                            | Rarely          |
| `src/core/auth/api-key-auth.middleware.ts` | `ApiKeyAuthMiddleware` — Express middleware for API key validation on `/api` and `/health` paths                                                                                                           | Rarely          |
| `src/core/auth/ApiKeyAuthFactory.ts`       | Factory — creates appropriate `IApiKeyAuth` implementation based on config                                                                                                                                 | Rarely          |
| `src/core/auth/ApiKeyService.ts`           | `ApiKeyService` — resolves API keys to users via `IApiKeyRepository` (session-scoped keys)                                                                                                                 | Sometimes       |
| `src/core/auth/basicAuth.ts`               | `BasicAuthFunction` — HTTP Basic Auth middleware for dashboard and Swagger                                                                                                                                 | Rarely          |
| `src/core/auth/casl.ability.ts`            | `CaslAbilityFactory`, `FilterSessions()` — CASL-based authorization: admin gets all rules, session-key users get session-scoped rules                                                                      | Rarely          |
| `src/core/auth/casl.rules.ts`              | `AdminRules()`, `SessionRules()` — CASL rule definitions                                                                                                                                                   | Rarely          |
| `src/core/auth/casl.types.ts`              | `Action`, `AppAbility`, `session` — CASL type definitions                                                                                                                                                  | Rarely          |
| `src/core/auth/policies.guard.ts`          | `PoliciesGuard` — decorator-based policy enforcement                                                                                                                                                       | Rarely          |
| `src/core/auth/policies.ts`                | Policy definitions                                                                                                                                                                                         | Rarely          |
| `src/core/auth/policies.decorator.ts`      | `@Policies()` decorator                                                                                                                                                                                    | Rarely          |
| `src/core/auth/WebSocketAuth.ts`           | `WebSocketAuth` — WebSocket authentication via `x-api-key` query parameter                                                                                                                                 | Rarely          |

## Understanding

Auth flow: API key in `X-Api-Key` header → `ApiKeyStrategy` validates (plain
comparison or SHA-512 hash with timing-safe equality) → returns
`User{isAdmin, session}` → `CaslAbilityFactory` creates ability →
`PoliciesGuard` enforces. Admin keys get full access to all sessions;
session-scoped keys are limited to their specific session. WebSocket connections
authenticate via `x-api-key` query param and go through the same CASL
authorization. Basic Auth protects `/dashboard` and Swagger when credentials are
configured. The `Auth` singleton auto-generates random credentials if it detects
weak defaults (like `admin`/`password`) to prevent accidental exposure.
