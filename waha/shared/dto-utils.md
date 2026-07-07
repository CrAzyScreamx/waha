---
title: DTOs, Enums & Structures
type: feature
layer: shared
keywords:
  [
    DTO,
    validation,
    class-validator,
    class-transformer,
    enums,
    request,
    response,
    webhook,
    session,
    message,
    group,
    contact,
    media,
    presence,
    pagination,
  ]
---

# DTOs, Enums & Structures

36 DTO files defining all API request/response shapes, webhook payloads, and
data structures. Uses `class-validator` for validation and `class-transformer`
for serialization.

## Dependencies

**Tools / services needed:** None **Dependent features:** All features
(foundation layer) **Packages:** `class-validator`, `class-transformer`,
`@nestjs/swagger`

## Files

| File                                        | Key Types                                                                                                                                                                                                                                                       | Coverage                                                                                                              |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `src/structures/base.dto.ts`                | `SessionQuery`, `SessionBaseRequest`, `Result`, `CountResponse`                                                                                                                                                                                                 | Base classes with default session name `'default'`                                                                    |
| `src/structures/enums.dto.ts`               | `WAHAEvents`, `WAHASessionStatus`, `WAHAEngine`, `WAHAPresenceStatus`, `WAMessageAck`                                                                                                                                                                           | Core enums — events (`message.any`, `session.status`, etc.), session states, engine types, presence states, ACK types |
| `src/structures/sessions.dto.ts`            | `SessionConfig`, `SessionDTO`, `SessionInfo`, `SessionCreateRequest`, `SessionUpdateRequest`, `MeInfo`, `ProxyConfig`, `NowebConfig`, `GowsConfig`, `WebjsConfig`, `IgnoreConfig`                                                                               | Session lifecycle and per-engine configuration                                                                        |
| `src/structures/chatting.dto.ts`            | `MessageTextRequest`, `MessageImageRequest`, `MessageFileRequest`, `MessageVoiceRequest`, `MessageVideoRequest`, `MessageLocationRequest`, `MessagePollRequest`, `MessageForwardRequest`, `MessageReactionRequest`, `CheckNumberStatusQuery`, `SendSeenRequest` | All message sending operations                                                                                        |
| `src/structures/chatting.buttons.dto.ts`    | `SendButtonsRequest`                                                                                                                                                                                                                                            | Interactive button messages                                                                                           |
| `src/structures/chatting.list.dto.ts`       | `SendListRequest`                                                                                                                                                                                                                                               | Interactive list messages                                                                                             |
| `src/structures/message.dto.ts`             | `ReplyToMessage`                                                                                                                                                                                                                                                | Reply-to-message structure                                                                                            |
| `src/structures/responses.dto.ts`           | `WAMessage`, `WAMessageBase`, `WAMessageReaction`, `WALocation`, `MessageSource`                                                                                                                                                                                | WhatsApp message response shapes                                                                                      |
| `src/structures/webhooks.dto.ts`            | `WAHAWebhook`, `WAHAWebhookMessage`, `WAHAWebhookSessionStatus`, `WAHAWebhookMessageAck`, `WAHAWebhookMessageRevoked`, `WAHAWebhookMessageEdited`, `WAHAWebhookPollVote`, `WAHAWebhookCallReceived`, etc.                                                       | All webhook payload types                                                                                             |
| `src/structures/webhooks.config.dto.ts`     | `WebhookConfig`, `RetriesConfiguration`, `HmacConfiguration`, `CustomHeader`, `RetryPolicy`                                                                                                                                                                     | Webhook configuration payloads                                                                                        |
| `src/structures/webhooks.ts`                | `WAHA_WEBHOOKS` array                                                                                                                                                                                                                                           | Registry of all webhook types for iteration                                                                           |
| `src/structures/media.dto.ts`               | `WAMedia`, `FileDTO`, `VoiceFileDTO`, `VideoFileDTO`                                                                                                                                                                                                            | Media response shapes                                                                                                 |
| `src/structures/media.s3.dto.ts`            | `S3MediaData`                                                                                                                                                                                                                                                   | S3-specific media metadata                                                                                            |
| `src/structures/groups.dto.ts`              | `CreateGroupRequest`, `GroupInfo`, `GroupParticipant`, `ParticipantsRequest`, `GroupsPaginationParams`                                                                                                                                                          | Group management                                                                                                      |
| `src/structures/groups.events.dto.ts`       | `GroupV2JoinEvent`, `GroupV2LeaveEvent`, `GroupV2UpdateEvent`, `GroupV2ParticipantsEvent`                                                                                                                                                                       | Group event payloads                                                                                                  |
| `src/structures/groups.webhooks.dto.ts`     | Group webhook types                                                                                                                                                                                                                                             | Group webhook payloads                                                                                                |
| `src/structures/contacts.dto.ts`            | `ContactQuery`, `ContactRequest`, `ContactUpdateBody`, `ContactsPaginationParams`                                                                                                                                                                               | Contact operations                                                                                                    |
| `src/structures/chats.dto.ts`               | `GetChatMessagesQuery`, `GetChatMessagesFilter`, `ReadChatMessagesQuery`, `ChatSummary`, `ChatArchiveEvent`, `PinMessageRequest`                                                                                                                                | Chat/message retrieval and management                                                                                 |
| `src/structures/channels.dto.ts`            | `Channel`, `ChannelListResult`, `CreateChannelRequest`, `ChannelSearchByText`, `ChannelSearchByView`                                                                                                                                                            | Channel/newsletter operations                                                                                         |
| `src/structures/calls.dto.ts`               | `CallData`                                                                                                                                                                                                                                                      | Call event data                                                                                                       |
| `src/structures/labels.dto.ts`              | `Label`, `LabelDTO`, `LabelID`, `LabelChatAssociation`                                                                                                                                                                                                          | Label management                                                                                                      |
| `src/structures/lids.dto.ts`                | `LidToPhoneNumber`                                                                                                                                                                                                                                              | LID (Linked Device ID) to phone mapping                                                                               |
| `src/structures/presence.dto.ts`            | `WAHAChatPresences`, `WAHAPresenceData`, `WAHASessionPresence`                                                                                                                                                                                                  | Presence information                                                                                                  |
| `src/structures/profile.dto.ts`             | Profile request/response types                                                                                                                                                                                                                                  | Profile picture, name, status management                                                                              |
| `src/structures/status.dto.ts`              | `TextStatus`, `ImageStatus`, `VoiceStatus`, `VideoStatus`, `DeleteStatusRequest`                                                                                                                                                                                | WhatsApp Status (stories)                                                                                             |
| `src/structures/events.dto.ts`              | `EventMessage`, `EventMessageRequest`, `EventResponse`, `EventResponsePayload`                                                                                                                                                                                  | Event messages (invitations)                                                                                          |
| `src/structures/files.dto.ts`               | `BinaryFile`, `RemoteFile`, `FileURL`, `FileContent`, `VoiceBinaryFile`, `VoiceRemoteFile`, `VideoBinaryFile`, `VideoRemoteFile`                                                                                                                                | File upload formats                                                                                                   |
| `src/structures/apikeys.dto.ts`             | `ApiKeyDTO`, `ApiKeyRequest`                                                                                                                                                                                                                                    | API key management                                                                                                    |
| `src/structures/auth.dto.ts`                | `PairingCodeResponse`                                                                                                                                                                                                                                           | Auth/pairing code response                                                                                            |
| `src/structures/environment.dto.ts`         | `WAHAEnvironment`                                                                                                                                                                                                                                               | Runtime environment info                                                                                              |
| `src/structures/pagination.dto.ts`          | `PaginationParams`, `LimitOffsetParams`, `SortOrder`                                                                                                                                                                                                            | Pagination helpers                                                                                                    |
| `src/structures/ping.dto.ts`                | Ping response                                                                                                                                                                                                                                                   | Health ping response                                                                                                  |
| `src/structures/properties.dto.ts`          | `@ChatIdProperty`, `@MessageIdProperty`, etc.                                                                                                                                                                                                                   | Swagger property decorators                                                                                           |
| `src/structures/server.dto.ts`              | Server info types                                                                                                                                                                                                                                               | Server management                                                                                                     |
| `src/structures/server.debug.dto.ts`        | `BrowserTraceQuery`                                                                                                                                                                                                                                             | Debug operations                                                                                                      |
| `src/structures/sessions.deprecated.dto.ts` | Deprecated session types                                                                                                                                                                                                                                        | Backward compatibility                                                                                                |

## Understanding

All DTOs use `class-validator` decorators (`@IsString()`, `@IsOptional()`,
`@IsEnum()`, etc.) for automatic request validation and `class-transformer` for
serialization/deserialization. Swagger decorators (`@ApiProperty()`,
`@ApiResponse()`) generate API documentation. Event names follow the
`domain.action` convention (e.g., `message.any`, `group.update`,
`session.status`). The `WAHA_WEBHOOKS` array in `webhooks.ts` serves as a
registry for iterating all webhook types. Base DTOs in `base.dto.ts` provide the
default session name `'default'` so all requests can omit the session name when
using the default session.
