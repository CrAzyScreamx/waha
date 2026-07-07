---
title: ChatWoot Integration
type: feature
layer: apps
keywords:
  [
    ChatWoot,
    CRM,
    inbox,
    conversation,
    webhook,
    integration,
    SDK,
    customer support,
    BullMQ,
    queue,
    consumer,
    migration,
    i18n,
  ]
---

# ChatWoot Integration

Full ChatWoot CRM integration that bridges WhatsApp events to ChatWoot
conversations. Uses the official ChatWoot SDK and runs 20+ BullMQ queues and
consumers for reliable async processing.

## Dependencies

**Tools / services needed:** Running ChatWoot instance, Redis (for BullMQ
queues) **Dependent features:** [[api-rest-api]], [[core-session-manager]],
[[core-webhooks]] **Packages:** `@figuro/chatwoot-sdk`, `@nestjs/bullmq`,
`bullmq`, `ioredis`

## Files

### Module & Services

| File                                                     | Role                                                        | Likely to edit? |
| -------------------------------------------------------- | ----------------------------------------------------------- | --------------- |
| `src/apps/chatwoot/chatwoot.module.ts`                   | Registers 20+ BullMQ queues and consumers                   | Sometimes       |
| `src/apps/chatwoot/services/ChatWootAppService.ts`       | Main app service — orchestrates ChatWoot integration        | Sometimes       |
| `src/apps/chatwoot/services/ChatWootQueueService.ts`     | Queue management for ChatWoot jobs                          | Sometimes       |
| `src/apps/chatwoot/services/ChatWootScheduleService.ts`  | Scheduled job management                                    | Rarely          |
| `src/apps/chatwoot/services/ChatWootWAHAQueueService.ts` | WAHA-side queue management                                  | Sometimes       |
| `src/apps/chatwoot/services/QueueManager.ts`             | Queue lifecycle manager                                     | Rarely          |
| `src/apps/chatwoot/services/QueueRegistry.ts`            | Queue registration and lookup                               | Rarely          |
| `src/apps/chatwoot/services/ConversationSelector.ts`     | Selects target ChatWoot conversation for a WhatsApp message | Sometimes       |

### ChatWoot API Client

| File                                                  | Role                              | Likely to edit? |
| ----------------------------------------------------- | --------------------------------- | --------------- |
| `src/apps/chatwoot/client/ChatWootInboxNewAPI.ts`     | ChatWoot inbox API client         | Sometimes       |
| `src/apps/chatwoot/client/ContactService.ts`          | Contact CRUD operations           | Sometimes       |
| `src/apps/chatwoot/client/ConversationService.ts`     | Conversation CRUD, status changes | Sometimes       |
| `src/apps/chatwoot/client/CustomAttributesService.ts` | Custom attribute management       | Rarely          |

### Consumers (BullMQ Job Handlers)

| Directory                                | Role                                                                                                       |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `src/apps/chatwoot/consumers/inbox/`     | ChatWoot inbox events — message created/updated/deleted, conversation created/status changed, commands     |
| `src/apps/chatwoot/consumers/waha/`      | WAHA events — message.any, reaction, edited, revoked, ack, call received/accepted/rejected, session.status |
| `src/apps/chatwoot/consumers/scheduled/` | Scheduled jobs — message cleanup, version check                                                            |
| `src/apps/chatwoot/consumers/task/`      | Task queues — contacts pull, messages pull                                                                 |

### Other

| File                                                 | Role                                                                                                   | Likely to edit? |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------- |
| `src/apps/chatwoot/api/ChatwootWebhookController.ts` | Receives webhooks from ChatWoot                                                                        | Sometimes       |
| `src/apps/chatwoot/api/ChatwootLocalesController.ts` | Locale management                                                                                      | Rarely          |
| `src/apps/chatwoot/contacts/`                        | Contact mapping — `InboxContactInfo.ts`, `WhatsAppContactInfo.ts`                                      | Sometimes       |
| `src/apps/chatwoot/messages/`                        | Message transformation between WAHA and ChatWoot formats                                               | Sometimes       |
| `src/apps/chatwoot/migrations/`                      | Database migrations for ChatWoot data                                                                  | Sometimes       |
| `src/apps/chatwoot/i18n/`                            | Internationalization — English as source locale                                                        | Sometimes       |
| `src/apps/chatwoot/storage/`                         | Storage abstractions for ChatWoot state                                                                | Sometimes       |
| `src/apps/chatwoot/waha/`                            | WAHA-specific adapters                                                                                 | Sometimes       |
| `src/apps/chatwoot/const.ts`                         | Custom attributes — `waha_whatsapp_chat_id`, `waha_whatsapp_jid`, `waha_whatsapp_lid`                  | Rarely          |
| `src/apps/chatwoot/env.ts`                           | `WAHA_CHATWOOT_COMMAND_PREFIX` (default `wa/`), message calendar threshold, languages folder, timezone | Rarely          |
| `src/apps/chatwoot/cli/`                             | CLI commands for ChatWoot management                                                                   | Rarely          |
| `src/apps/chatwoot/cache/`                           | Caching layer                                                                                          | Rarely          |
| `src/apps/chatwoot/dto/`                             | Data transfer objects                                                                                  | Rarely          |
| `src/apps/chatwoot/error/`                           | Error handling                                                                                         | Rarely          |

## Understanding

The ChatWoot module listens to WhatsApp engine events and mirrors them as
ChatWoot conversations/messages through BullMQ queues for reliable async
processing. Uses the official ChatWoot API client for all operations. No
synthetic events are introduced — everything maps onto existing webhook or
engine events (e.g., `message.any`). User-facing strings go through the i18n
structure with English as the source locale. The command prefix `wa/`
(configurable via `WAHA_CHATWOOT_COMMAND_PREFIX`) allows sending commands
through ChatWoot conversations.
