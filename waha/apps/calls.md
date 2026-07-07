---
title: Calls App
type: feature
layer: apps
keywords: [calls, voice call, video call, call event, listener, WhatsApp call]
---

# Calls App

Minimal app for handling WhatsApp call events — receiving, accepting, and
rejecting calls.

## Dependencies

**Tools / services needed:** None beyond core WAHA **Dependent features:**
[[core-session-manager]], [[api-rest-api]] **Packages:** None specific

## Files

| File                                         | Role                                                         | Likely to edit? |
| -------------------------------------------- | ------------------------------------------------------------ | --------------- |
| `src/apps/calls/calls.module.ts`             | Exports `CallsAppService` as provider                        | Rarely          |
| `src/apps/calls/services/CallsAppService.ts` | Main service — orchestrates call handling                    | Rarely          |
| `src/apps/calls/services/CallsListener.ts`   | Call event listener — subscribes to call events from session | Sometimes       |
| `src/apps/calls/dto/config.dto.ts`           | Configuration DTO for call settings                          | Rarely          |

## Understanding

A lightweight app that subscribes to WhatsApp call events (incoming calls, call
accepted, call rejected) through the session event observables. Provides
configuration for call handling behavior. Integrates with the ChatWoot
integration to surface call events in ChatWoot conversations.
