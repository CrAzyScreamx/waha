---
title: WAHA
type: overview
---

# WAHA

**W**hats**A**pp **H**TTP **A**PI — a self-hosted REST API that lets you
send/receive WhatsApp messages in under 5 minutes. Supports multiple WhatsApp
engine backends behind a unified interface.

## Tools

**Languages:** TypeScript **Runtime / Platform:** Node.js 22, NestJS v11, Docker
**Key third-party dependencies:** whatsapp-web.js, Baileys (NOWEB), WPPConnect,
GOWS (rust bridge), BullMQ, MongoDB, PostgreSQL, Redis, AWS S3, ChatWoot SDK,
Puppeteer, sharp

## Purpose

WAHA provides a drop-in WhatsApp HTTP API you can run on your own
infrastructure. It abstracts multiple WhatsApp engine implementations (WEBJS,
NOWEB, GOWS, WPP) so users can pick the engine that best fits their needs. Ships
in Core (single session, minimal features) and Plus (multi-session, external
storage integrations) editions. Used by developers and businesses who need
programmatic WhatsApp access without relying on the official Business API.
