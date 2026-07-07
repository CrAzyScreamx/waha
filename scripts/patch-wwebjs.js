#!/usr/bin/env node
// Patch whatsapp-web.js for a WhatsApp Web change: refreshQR moved from
// WAWebCmd.Cmd to WAWebLaunchSocketUtils. The pinned wwebjs
// (github:devlikeapro/whatsapp-web.js#fork-main-2026-06-26, the newest branch)
// still calls the old location on QR auto-refresh, so hosts that received the
// newer web build throw "Cmd.refreshQR is not a function" and the QR stops
// refreshing. Fall back to the new API (already used by cancelPairingCode()).
// ponytail: remove this whole file + its Dockerfile RUN once upstream
// whatsapp-web.js ships a fix. https://github.com/devlikeapro/whatsapp-web.js
const fs = require('fs');

const file = 'node_modules/whatsapp-web.js/src/Client.js';
const from = "window.require('WAWebCmd').Cmd.refreshQR();";
const to =
  "try { window.require('WAWebCmd').Cmd.refreshQR(); } " +
  "catch (e) { window.require('WAWebLaunchSocketUtils').refreshQR(); }";

const src = fs.readFileSync(file, 'utf8');

if (src.includes(to)) {
  console.log('wwebjs refreshQR patch already applied');
  process.exit(0);
}
if (!src.includes(from)) {
  console.error(
    'wwebjs patch target not found — upstream code changed; review scripts/patch-wwebjs.js',
  );
  process.exit(1);
}

fs.writeFileSync(file, src.replace(from, to));
console.log('wwebjs refreshQR fallback patch applied');
