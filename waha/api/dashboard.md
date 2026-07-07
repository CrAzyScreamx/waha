---
title: Dashboard
type: feature
layer: api
keywords:
  [
    dashboard,
    static files,
    ServeStatic,
    Basic Auth,
    admin UI,
    WAHA_DASHBOARD,
    web interface,
  ]
---

# Dashboard

Admin web dashboard served as static files at `/dashboard`. The source directory
(`src/dashboard/`) contains only a `.gitkeep` — the actual HTML/JS/CSS files are
placed at build/deploy time.

## Dependencies

**Tools / services needed:** `@nestjs/serve-static`, Express Basic Auth
middleware **Dependent features:** [[core-config]], [[core-auth]] **Packages:**
`@nestjs/serve-static`, `express-basic-auth`

## Files

| File                                            | Role                                                                                                                                                                            | Likely to edit? |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `src/dashboard/.gitkeep`                        | Placeholder — dashboard files are added at build/deploy time                                                                                                                    | No              |
| `src/core/app.module.core.ts`                   | `ServeStaticModule` configuration — serves `src/dashboard/` at `/dashboard` route                                                                                               | Sometimes       |
| `src/core/config/DashboardConfigServiceCore.ts` | `enabled` (via `WAHA_DASHBOARD_ENABLED`, default `true`), `dashboardUri` (hardcoded to `/dashboard`), `credentials` (via `WAHA_DASHBOARD_USERNAME` / `WAHA_DASHBOARD_PASSWORD`) | Rarely          |

## Understanding

The dashboard is served statically via NestJS `ServeStaticModule` which maps the
`src/dashboard/` directory to the `/dashboard` route. In
`AppModuleCore.configure()`, if dashboard credentials are set
(`WAHA_DASHBOARD_USERNAME` / `WAHA_DASHBOARD_PASSWORD`), `BasicAuthFunction`
middleware is applied to protect the route. The dashboard HTML/JS/CSS files must
be placed in `src/dashboard/` during the Docker build or deployment process —
they are not committed to the repository (hence the `.gitkeep`). The dashboard
can be disabled entirely via `WAHA_DASHBOARD_ENABLED=false`.
