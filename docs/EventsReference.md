# NOIZ RITES (Right-in-Time Event System)

> **Version:** 1.0
> **Status:** Canonical
> **Maintainers:** NOIZ Systems & Interface Teams
> **Scope:** Platform-wide Right-in-Time event routing for user, stream, chat, quest, and support systems.

---

## Overview

The **NOIZ Right-in-Time Event System (RITES)** powers all dynamic activity across the NOIZ ecosystem — from chat updates and stream states to quest progress and currency triggers.

Unlike generic real-time buses, **RITES** delivers events *intelligently and contextually*, ensuring modules, users, and agents only receive data when it is relevant, reducing noise and bandwidth overhead.

---

## Event Architecture

Every RITES packet follows the same structure:

```json
{
  "event": "chat.message",
  "timestamp": "2025-11-05T23:21:00Z",
  "context": {
    "userId": "u_8231",
    "channelId": "ch_3201",
    "sessionId": "s_2019"
  },
  "payload": {
    "text": "Hello NOIZ!",
    "attachments": []
  }
}
```

| Field       | Type   | Description                                        |
| ----------- | ------ | -------------------------------------------------- |
| `event`     | string | Fully qualified event name (`category.action`)     |
| `timestamp` | string | UTC ISO 8601 emission time                         |
| `context`   | object | Optional routing metadata (user, channel, session) |
| `payload`   | object | Event-specific body content                        |

---

## Event Categories

| Category    | Description                                    |
| ----------- | ---------------------------------------------- |
| `user.*`    | Authentication, settings, and identity actions |
| `quest.*`   | Quest progression and reward tracking          |
| `chat.*`    | Messages, moderation, and channel activity     |
| `stream.*`  | Stream lifecycle and metadata updates          |
| `support.*` | Subscriptions, donations, and gifting          |
| `asset.*`   | Digital goods, inventory, or sticker events    |
| `system.*`  | Hub or diagnostics reporting                   |
| `goal.*`    | Stream goals, milestones, and progress updates |

---

## 1. User Events

| Event                  | Description                             | Payload Example                                                |
| ---------------------- | --------------------------------------- | -------------------------------------------------------------- |
| `user.login`           | User authenticated successfully.        | `{ "username": "Morphine", "id": "u_001", "method": "oauth" }` |
| `user.logout`          | Session ended or expired.               | `{ "id": "u_001" }`                                            |
| `user.registered`      | Account creation event.                 | `{ "id": "u_001", "email": "x@noiz.gg" }`                      |
| `user.settingsUpdated` | Preferences or profile changed.         | `{ "theme": "dark", "notifications": true }`                   |
| `user.avatarChanged`   | Avatar updated.                         | `{ "url": "/avatars/u_001.png" }`                              |
| `user.levelUpdate`     | XP or level milestone.                  | `{ "level": 15, "xp": 4500000 }`                               |
| `user.walletLinked`    | Payment or Constellation wallet linked. | `{ "wallet": "constellation" }`                                |

---

## 2. Quest & Inventory Events

| Event                | Description                             | Payload Example                                                |
| -------------------- | --------------------------------------- | -------------------------------------------------------------- |
| `quest.started`      | A user begins a quest.                  | `{ "questId": "q_002", "title": "Streaming Debut" }`           |
| `quest.updated`      | Progression updated.                    | `{ "questId": "q_002", "progress": 45 }`                       |
| `quest.completed`    | Quest completed and reward distributed. | `{ "questId": "q_002", "reward": "faded_decibels" }`           |
| `asset.granted`      | New asset or item awarded.              | `{ "itemId": "sticker_fox01", "type": "collectible" }`         |
| `asset.used`         | Asset activated in UI.                  | `{ "itemId": "sticker_fox01" }`                                |
| `asset.equipped`     | Item equipped (avatar, frame, etc.).    | `{ "slot": "frame", "itemId": "frame_neon" }`                  |
| `asset.traded`       | Marketplace trade completed.            | `{ "from": "u_001", "to": "u_002", "itemId": "badge_rare01" }` |
| `achievement.earned` | Milestone achieved.                     | `{ "achievementId": "a_099" }`                                 |

---

## 3. Chat & Community Events

| Event                  | Description                          | Payload Example                                                           |
| ---------------------- | ------------------------------------ | ------------------------------------------------------------------------- |
| `chat.message`         | New message sent.                    | `{ "user": "Morphine", "text": "Let's GO!", "channel": "announcements" }` |
| `chat.deleted`         | Message removed.                     | `{ "messageId": "m_453" }`                                                |
| `chat.purged`          | Moderator cleared multiple messages. | `{ "channel": "tea-room", "count": 42 }`                                  |
| `chat.cleared`         | Entire chat reset.                   | `{ "channel": "waiting-room" }`                                           |
| `chat.joined`          | User joined a channel.               | `{ "user": "Morphine" }`                                                  |
| `chat.left`            | User left a channel.                 | `{ "user": "Morphine" }`                                                  |
| `chat.userBanned`      | Moderator banned a user.             | `{ "user": "Spammer123", "duration": 3600 }`                              |
| `chat.userTimedOut`    | Temporary timeout applied.           | `{ "user": "Spammer123", "duration": 300 }`                               |
| `chat.userModded`      | Role elevated to moderator.          | `{ "user": "Helper01" }`                                                  |
| `chat.userUnmodded`    | Role removed.                        | `{ "user": "Helper01" }`                                                  |
| `chat.reportSubmitted` | Report submitted.                    | `{ "user": "ViewerX", "reason": "Spam" }`                                 |

---

## 4. Streaming Events

| Event                     | Description              | Payload Example                                                   |
| ------------------------- | ------------------------ | ----------------------------------------------------------------- |
| `stream.started`          | Stream begins.           | `{ "channelId": "noiz://morphine", "title": "Let’s Code NOIZ!" }` |
| `stream.ended`            | Stream stops.            | `{ "channelId": "noiz://morphine" }`                              |
| `stream.paused`           | Stream paused.           | `{ "reason": "network" }`                                         |
| `stream.resumed`          | Stream resumed.          | `{}`                                                              |
| `stream.titleUpdated`     | Stream title changed.    | `{ "title": "Working on Scaffold v2" }`                           |
| `stream.categoryUpdated`  | Stream category changed. | `{ "category": "Development" }`                                   |
| `stream.overlayTriggered` | Overlay triggered.       | `{ "overlay": "followAlert" }`                                    |
| `stream.metricUpdated`    | Metric updated.          | `{ "viewers": 210, "uptime": 3600 }`                              |
| `stream.goalProgressed`   | Goal partial progress.   | `{ "goalId": "subs_100", "progress": 75 }`                        |
| `stream.goalCompleted`    | Goal completed.          | `{ "goalId": "subs_100" }`                                        |

---

## 5. Monetization & Support Events

| Event                    | Description              | Payload Example                          |
| ------------------------ | ------------------------ | ---------------------------------------- |
| `support.subscription`   | New subscription.        | `{ "user": "FanGirl99", "tier": 2 }`     |
| `support.resubscription` | Renewed subscription.    | `{ "user": "FanGirl99", "months": 6 }`   |
| `support.gifted`         | Gifted sub or item.      | `{ "from": "Viewer1", "to": "Viewer2" }` |
| `support.cheer`          | Decibels or cheers sent. | `{ "amount": 2500, "currency": "dB" }`   |

---

## 6. System & Diagnostic Events

| Event                | Description                       | Payload Example                                      |
| -------------------- | --------------------------------- | ---------------------------------------------------- |
| `system.ready`       | System initialized and connected. | `{ "version": "1.0.0", "uptime": 240 }`              |
| `system.warning`     | Service degradation.              | `{ "code": "ingest_latency", "severity": "medium" }` |
| `system.error`       | Critical error.                   | `{ "code": "overlay_crash", "stack": "..." }`        |
| `system.reconnected` | Reconnected after downtime.       | `{ "duration": 12 }`                                 |

---

## 7. Goal Events

| Event             | Description       | Payload Example                            |
| ----------------- | ----------------- | ------------------------------------------ |
| `goal.created`    | Goal created.     | `{ "goalId": "subs_100", "target": 100 }`  |
| `goal.progressed` | Partial progress. | `{ "goalId": "subs_100", "progress": 45 }` |
| `goal.completed`  | Goal achieved.    | `{ "goalId": "subs_100" }`                 |

---

## Emission Patterns

### 1. From Modules

```js
ctx.emit("asset.used", { itemId: "frame_neon" });
```

### 2. From Agents

```js
Hub.emit("system.warning", { code: "ingest_latency" });
```

### 3. From User Actions

```js
ClientEventBus.emit("chat.message", { text: "hi!" });
```

---

## Subscription API

```js
ctx.on("stream.*", handleStreamEvent);
ctx.on(["user.login", "user.logout"], handleUserState);
```

Supports multi-binding and wildcard (`*`) subscriptions.

---

## Versioning Policy

| Field   | Description                              |
| ------- | ---------------------------------------- |
| `major` | Breaking schema or event behavior change |
| `minor` | New event or payload field added         |
| `patch` | Internal update or fix                   |

Example module dependency:

```json
"requires": { "rites": ">=1.0.0 <2.0.0" }
```

---

## Reserved Events

| Event             | Purpose                                 |
| ----------------- | --------------------------------------- |
| `rail.hidden`     | ❌ Forbidden – rail visibility mandatory |
| `layout.override` | Reserved for Interface Systems only     |
| `hub.shutdown`    | System-level maintenance trigger        |

Modules attempting to emit or intercept reserved events will fail certification.

---

## Testing via Scaffold Demo

Use [`scaffoldDemo.html`](./scaffoldDemo.html) → Dev Bar → **“Emit Test”** to simulate RITES events in-browser.

---

## Developer Contact

**Systems Team:** `systems@noiz.gg`
**Interface Systems Team:** `ui@noiz.gg`
