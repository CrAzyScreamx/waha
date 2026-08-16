---
name: update-waha
description: Merge new upstream devlikeapro/waha commits into this fork's `core` branch, resolve conflicts, and hand off to the user for commit/push. Use when the user says "/update-waha", "update waha", "pull upstream", "sync the fork", or asks whether upstream has new changes.
---

# Update WAHA from upstream

This fork (`CrAzyScreamx/waha`, branch `core`) tracks `devlikeapro/waha`.
`upstream` = devlikeapro, `origin` = the fork.

## 1. Check for updates

```powershell
git status --short          # must be clean; if not, stop and ask the user
git fetch upstream --tags
git log --oneline HEAD..upstream/core
```

No commits listed → report "already up to date" and stop.
Otherwise show the user the commit list and the version bump
(`git diff HEAD...upstream/core -- src/version.ts`).

## 2. Merge

```powershell
git merge upstream/core --no-commit --no-ff
```

Before resolving anything, know what this fork changed on top of upstream:

```powershell
git diff --stat upstream/core...HEAD
```

Files appearing in **both** that list and the upstream diff are the ones that
conflict or silently drift.

## 3. Resolve conflicts

Rule of thumb per known customization:

| Area | Resolution |
|---|---|
| `Dockerfile` — `CHROMIUM_VERSION` / `CHROMIUM_*_DEB_SHA1` | **Keep ours.** Chromium 149 pinned from snapshot.debian.org is the only browser that works on the kernel-6.17 deployment host. Never take an upstream chromium bump here. |
| `Dockerfile` — `CHROME_VERSION` | Take upstream's; the Chrome path is unused by this fork (`USE_BROWSER=chromium`). Keep our NOTE comment. |
| `Dockerfile` — sharp x86-64 rebuild, opustags, `patch-wwebjs.js` RUN, `init-waha` | Keep ours, re-apply on top of upstream's layer changes. |
| `src/structures/groups.dto.ts`, `src/api/groups.controller.ts`, `src/core/abc/session.abc.ts`, `session.webjs.core.ts` — `AddParticipantsRequest` / `autoSendInviteV4` | Keep ours; upstream still uses `ParticipantsRequest`. |
| `WebjsClientCore.ts` — `RestoreChatFindImpl`, `AdaptSendGroupInviteMessage`, and their `injectWaha()` calls | Keep ours; both must survive and stay wired into `injectWaha()`. |
| `session.webjs.core.ts` — `shouldIgnoreError` (detached Frame) | Keep ours, alongside upstream's `shouldIgnoreProtocolError`. |
| `src/structures/labels.dto.ts` + `.test.ts` | Keep ours. |
| `waha/**` (vault), `.github/workflows/build-custom-image.yaml`, `package-lock.json`, `scripts/patch-wwebjs.js` | Fork-only files; upstream never touches them. |

Anything **not** in that table and not obvious: do **not** guess. Show the user
the conflicting hunks with both sides and ask how to resolve.

## 4. Verify

Grep that each customization above survived the auto-merge — git merges
cleanly and still drops intent when upstream rewrites the surrounding block.

```powershell
npx tsc --noEmit -p tsconfig.json
```

Expected noise: errors about members missing from `whatsapp-web.js` /
`whatsapp-rust-bridge` types. `node_modules` here is installed from the stale
`package-lock.json`, while the Docker build installs from `yarn.lock`; new
upstream features land in `yarn.lock` first. Errors in **fork-owned** code are
real — fix those.

If `yarn.lock` moved the `whatsapp-web.js` commit, re-check that
`scripts/patch-wwebjs.js` still finds its target in the new commit
(`https://raw.githubusercontent.com/devlikeapro/whatsapp-web.js/<sha>/src/Client.js`
must still contain `window.require('WAWebCmd').Cmd.refreshQR();`) — the script
exits 1 and fails the Docker build otherwise.

## 5. Hand off

Leave the merge staged. Report what changed and how each conflict was resolved,
then ask the user to commit and push — do not do it for them:

```powershell
git commit -m "Merge upstream devlikeapro/waha <version> into core"
git push origin core
```

Releases go out by pushing a tag (that triggers `build-custom-image.yaml`) —
ask before tagging.
