---
title: CI/CD, Testing & Quality
type: feature
layer: infrastructure
keywords:
  [
    CI,
    CD,
    GitHub Actions,
    build,
    test,
    smoke,
    Goss,
    performance,
    pre-commit,
    commit message,
    lint,
    oxlint,
    Jest,
    e2e,
    unit,
  ]
---

# CI/CD, Testing & Quality

GitHub Actions workflows, pre-commit hooks, test suites, and linting
configuration.

## Dependencies

**Tools / services needed:** GitHub Actions, Docker (for smoke tests)
**Dependent features:** All features **Packages:** `jest`, `ts-jest`, `oxlint`,
`prettier`, `supertest`

## Files

### GitHub Actions

| File                                        | Role                                                     | Likely to edit? |
| ------------------------------------------- | -------------------------------------------------------- | --------------- |
| `.github/workflows/build.yaml`              | Main build pipeline — lint, typecheck, test, build       | Sometimes       |
| `.github/workflows/build-custom-image.yaml` | Custom Docker image build workflow                       | Rarely          |
| `.github/workflows/dev.yaml`                | Development workflow — PR checks, branch builds          | Rarely          |
| `.github/workflows/github-translate.yml`    | Translation automation workflow                          | Rarely          |
| `.github/FUNDING.yml`                       | GitHub Sponsors configuration                            | Rarely          |
| `.github/gh-team-labels.yml`                | Team-based label automation for issues/PRs               | Rarely          |
| `.github/clear-gh-runs.sh`                  | Script to clear GitHub Actions run history               | Rarely          |
| `.github/ISSUE_TEMPLATE/`                   | GitHub issue templates for bug reports, feature requests | Rarely          |

### Pre-commit Hooks

| File                                    | Role                                                                                                                                                                                   | Likely to edit? |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `.pre-commit-config.yaml`               | Pre-commit hook configuration                                                                                                                                                          | Rarely          |
| `.precommit/validate_commit_message.py` | Git commit-msg hook — validates: if staged files include `src/plus/*`, commit must start with `[PLUS]`. If commit starts with `[PLUS]`, all staged files must be from `src/plus/` only | Rarely          |

### Tests

| File                         | Role                                                                                      | Likely to edit? |
| ---------------------------- | ----------------------------------------------------------------------------------------- | --------------- |
| `tests/smoke/goss.yaml`      | Goss-based smoke tests for container validation — checks ports, processes, file existence | Rarely          |
| `tests/smoke/goss_wait.yaml` | Goss wait configuration — waits for service readiness before running tests                | Rarely          |
| `tests/perf/send.js`         | Performance testing — message sending benchmark                                           | Rarely          |
| `tests/perf/start.js`        | Performance testing — session startup benchmark                                           | Rarely          |
| `src/__tests__/`             | Jest test suites — unit tests colocated with source, e2e tests in `__tests__/e2e/`        | Sometimes       |

### Linting & Formatting

| File              | Role                                             | Likely to edit? |
| ----------------- | ------------------------------------------------ | --------------- |
| `.oxlintrc.json`  | Oxlint configuration — lint rules for TypeScript | Sometimes       |
| `.eslintignore`   | ESLint ignore patterns                           | Rarely          |
| `.prettierrc`     | Prettier configuration — code formatting rules   | Rarely          |
| `.prettierignore` | Prettier ignore patterns                         | Rarely          |

## Understanding

Test strategy: Jest for unit and e2e tests (configured as separate projects in
`package.json`), Goss for container-level smoke tests, and manual performance
scripts. Pre-commit hooks enforce commit message conventions — `[PLUS]` prefix
for Plus-only changes, no Plus files in non-Plus commits. Oxlint replaces ESLint
for faster TypeScript linting. CI runs lint, typecheck, and tests on every PR.
