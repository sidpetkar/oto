# OTODrop — Product Requirements Document v2.0
> "Send any file. Any device. Direct when you can. Internet when you must."

**Brand:** OTO (Otter — seamless across any medium)
**Product:** OTODrop (local-first P2P transfer)
**Sister product:** OTOShare (cloud-powered async delivery, existing Firebase project)
**Domain:** oto.direct
**Version:** 2.0 — updated from full product discussion
**Status:** Pre-build, ready for Cursor scaffold

---

## 0. Brand Architecture

```
OTO (parent brand — otter, seamless across any medium)
├── OTODrop   → Local P2P. No internet. Instant.     drop.oto.direct
└── OTOShare  → Cloud async. Save & send anywhere.   share.oto.direct
```

These are complementary, not competing.
- OTODrop = hook product (free, viral, daily use)
- OTOShare = upsell (paid, cloud, async delivery)

**OTOShare action:** Deploy existing Firebase project to share.oto.direct immediately. Clean UI to OTO brand. Ship as v1 while OTODrop is in development.

---

## 1. One-Line Positioning

> **"Send any file. Any device. No internet. No limits."**

Secondary: *"WhatsApp for files — your groups, your people, no compression, no cloud."*

**Positioning statements (use across marketing):**
- "AirDrop for everyone. Not just Apple people."
- "Your file goes straight there. Not up, then down. Straight there."
- "The only transfer app that finishes what it started."
- "Open. Tap. Done. No accounts. No cables. No cloud."
- "Finally — a file transfer app that works as fast as your WiFi actually is."

---

## 2. The Two Modes — Core Mental Model

This is the most important concept to understand and communicate:

```
LOCAL MODE                          RELAY MODE
────────────────────────────────    ────────────────────────────────
Same physical location              Different cities / networks

No internet needed                  Cellular or WiFi → relay server
WiFi Direct or LAN                  WebRTC P2P after handshake
80–120 MB/s                         5–50 MB/s (cellular limited)
Zero server cost                    Small relay bandwidth cost
AirDrop / LocalSend killer          WhatsApp killer (no compression)

Works: no WiFi, no SIM, airplane    Needs: internet on both devices
```

App detects mode automatically. User never chooses. If direct is possible, it uses direct. If not, it uses relay and tells the user which mode is active.

**Critical truth to communicate clearly:**
OTODrop's "no internet" story is the hero for photographers, classrooms, events, field teams — people in the same physical space. For sharing across cities, internet is the pipe (cellular or WiFi) — but unlike WhatsApp/email, there's no compression, no size limit, no permanent cloud storage, E2E encrypted.

---

## 3. How It Actually Works — Simple Terms

**Same WiFi (LAN mode):**
Both devices connected to the same router (home, office, hotel). Router is just the address book — file goes device-to-device directly, never to the internet. App uses mDNS to find devices automatically. Takes 1–3 seconds.

**WiFi Direct (no router):**
App creates a direct radio link between two devices silently in the background. No user goes to Settings → Hotspot. Range: ~200m open space, ~50m indoors. Same tech AirDrop and Blip use. No internet, no router needed.

**Relay mode (different locations):**
Both connect to relay.oto.direct over internet. Relay does a 2-second WebRTC handshake (finds the fastest path). After that, data flows peer-to-peer where possible. Relay only carries data if P2P is blocked by firewalls. File never permanently stored on server.

**WiFi vs cellular:** User does not need to toggle anything. App uses whatever internet connection the device has — WiFi, 4G, 5G — it doesn't matter. If both are on cellular in different cities, it works.

**Proximity:** Required only for local mode. For relay mode, they can be anywhere on earth.

---

## 4. User Scenarios + Real Flows

### Scenario A — Same location, no internet
Wedding photographer + editor, same venue.
```
Both open app → auto-named (Scout / Ripple) → appear on each other's radar
Photographer taps editor → selects 47GB RAW folder → sends
Editor sees approval: "Scout wants to send 47GB wedding_finals/ — Accept?"
Transfer at 90 MB/s over LAN → Done in ~9 mins → SHA-256 verified
Zero internet. Zero setup. Zero typing.
```

### Scenario B — All 4 on cellular, different cities
Friend group wants to share holiday photos without WhatsApp compression.
```
One person creates room #tripgoa2025 or shares QR
All 4 open app → join room → internet connects them via relay
Sender drops 400 photos → all 3 receive simultaneously
No compression. Files land directly on device. Room history logged.
Speed: bottlenecked by slowest cellular uplink (~5–15 MB/s on 4G)
```

### Scenario C — Mixed: office WiFi + 2 cellular + 1 offline
You (office WiFi), Friend B (Jio 5G), Friend C (Airtel 4G), Friend D (offline).
```
You open room → drop files
Friend B + C: receive live via relay (internet)
Friend D: file queued encrypted on relay server
When Friend D comes online → auto-delivered, no action needed
Queue expiry: 24 hrs (free), 7 days (Pro)
```

### Scenario D — Stranger's laptop, no app installed
Journalist in field, laptop crashed, borrows colleague's MacBook.
```
Journalist opens drop.oto.direct in MacBook's browser (PWA — zero install)
Own phone has OTODrop native app
Both on same café WiFi → mDNS discovers each other on LAN
WebRTC transfer begins → progress visible in browser → Done
No account, no install, no internet needed (same WiFi)
```

### Scenario E — Classroom, 1→30 broadcast
Teacher wants to send 500MB PDF to 30 students. No cloud, no compression.
```
Teacher opens room → shares PIN on whiteboard
30 students type PIN → all join room
Teacher drops file → 30 parallel streams begin
Teacher sees live grid: 30 progress bars
All receive in ~30 sec on 5GHz WiFi
```

---

## 5. ICP (Ideal Customer Profile)

| ICP | Situation | Why OTODrop | Monetise via |
|---|---|---|---|
| Field creatives | Photographers, videographers, journalists — large files, no internet | Local speed + no size limit | Pro (rooms, history) |
| Students & classrooms | Teacher → class distribution, group project files | Group broadcast rooms | Team (edu license) |
| Small business / retail | Client walks in with files on phone | Zero-install PWA receive mode | Pro (persistent rooms) |
| Events & conferences | Speaker → AV, organiser → volunteers | Temp group rooms | Event license |
| IT / field tech | Push files to isolated/offline machines | LAN mode, no cloud policy issue | Team (audit log) |
| Travelers / digital nomads | Airplane, no internet, share with person next to you | BT / WiFi Direct | Free (conversion hook) |
| Developer / power user | Large project files between machines on same desk | LAN speed, no size cap | Pro |

---

## 6. Competitor Map

| | LocalSend | Blip | AirDrop | Xender | **OTODrop** |
|---|---|---|---|---|---|
| Android → iPhone | ✓ | ✓ | ✗ | ✓ | ✓ |
| Browser / PWA | ✗ | ✗ | ✗ | ✗ | **✓** |
| No internet | ✓ | ✓ | ✓ | ✓ | ✓ |
| Speed | 20 MB/s | 40 MB/s | 60 MB/s | 5 MB/s | **100+ MB/s** |
| Resume on drop | ✗ | ✓ | ✗ | ✗ | ✓ |
| Persistent rooms | ✗ | ✗ | ✗ | ✗ | **✓** |
| Group 1→N send | ✗ | ✗ | limited | ✗ | **✓** |
| Transfer history | ✗ | ✗ | ✗ | ✗ | **✓** |
| Social graph | ✗ | contacts | ✗ | ✗ | **✓ rooms** |
| E2E encryption | ✓ | ✗ | ✓ | ✗ | ✓ |
| External drive browse | ✗ | ✗ | ✗ | ✗ | **✓ (Phase 4)** |
| Hashtag rooms | ✗ | ✗ | ✗ | ✗ | **✓** |
| Cloud rescue fallback | ✗ | ✓ | ✗ | ✗ | ✓ (opt-in) |
| Open source | ✓ | ✗ | ✗ | ✗ | ✗ (commercial) |

**Moat summary:** Rooms + social graph + hashtag discovery + browser PWA. LocalSend is the best tool. OTODrop is the best product. Blip routes cross-network through their servers — true P2P is our speed edge. Their moat is brand + contact UX. Ours is rooms layer + speed + browser access.

**Do NOT fork LocalSend.** Dart/Flutter only, no web layer, no rooms concept, no shared TS code. Their protocol is documented — study it, don't inherit it.

---

## 7. Platform Targets

| Platform | Type | Priority | Notes |
|---|---|---|---|
| Android | React Native (Expo) | P0 | WiFi Direct native module (Kotlin) |
| iOS | React Native (Expo) | P0 | MultipeerConnectivity native module (Swift) |
| Windows | Electron | P0 | mDNS + HTTP/2 server |
| macOS | Electron | P1 | Same codebase as Windows |
| Browser (PWA) | Next.js | P1 | WebRTC, zero install, universal fallback |
| Linux | Electron | P2 | Same codebase |

**Flutter vs React Native decision:** React Native chosen. Reason: shared TypeScript transfer engine (`packages/core`) runs on mobile, Electron renderer, and browser — one language, one team. Flutter would require separate Dart codebase for web layer and no shared logic with Electron.

**Flutter web as PWA:** Possible but Flutter Web's WebRTC support is weak, filesystem access sandboxed, WiFi Direct native modules don't exist. Next.js PWA gives proper WebRTC + service worker support.

---

## 8. Transfer Technology Stack

### Protocol Priority (auto-selected by app)

```
1. WiFi Direct (P2P WiFi)         → Primary, no router needed, 80–250 MB/s
2. LAN HTTP/2 (same network)      → Secondary, router present, 80–120 MB/s
3. WebRTC DataChannels            → Browser + cross-network, 30–80 MB/s
4. Cloud Relay (WebSocket)        → Fallback only, opt-in, 5–50 MB/s (cellular)
5. Bluetooth                      → Emergency fallback, 2–3 MB/s
```

### Transfer Protocol Design
```
Sender                      Receiver
  │                              │
  ├── mDNS broadcast ──────────► │   Discovery (LAN)
  │ ◄── device hello ────────────│   Handshake + device fingerprint
  ├── session offer ───────────► │   File metadata: name, size, checksum
  │ ◄── accept/reject ───────────│   User consent
  ├── chunk stream ────────────► │   1MB chunks, parallel streams
  │ ◄── ACK per chunk ───────────│   Resume tracking
  ├── EOF + SHA-256 ───────────► │   Integrity verify
  │ ◄── complete ────────────────│   Done
```

**Chunk size:** 1MB default, adaptive based on measured throughput
**Checksum:** SHA-256 per file, verified on receive
**Resume:** Receiver stores received byte offset in SQLite, sends on reconnect
**Encryption:** X25519 key exchange + AES-256-GCM per chunk

### WiFi Requirements
- **Same WiFi (LAN):** Both devices connected to same router. File never touches internet. mDNS discovery auto. No setup.
- **WiFi Direct:** No router needed. App negotiates P2P link in background. User does nothing. Android: `WifiP2pManager`. iOS: `MultipeerConnectivity`.
- **No WiFi at all:** App falls back to Bluetooth (slow) or prompts to enable WiFi Direct.
- **Different networks:** Cellular or WiFi → relay server. Internet required. App auto-detects and shows mode indicator.

---

## 9. Full Tech Stack

### Monorepo Structure (Turborepo + pnpm)
```
oto-drop/
├── apps/
│   ├── mobile/          # React Native + Expo (iOS + Android)
│   ├── desktop/         # Electron (Win + Mac + Linux)
│   ├── web/             # Next.js PWA
│   └── relay/           # Node.js relay + signaling server
├── packages/
│   ├── core/            # Shared transfer engine (TypeScript)
│   ├── ui/              # Shared React component library
│   ├── protocol/        # Shared chunk/handshake protocol types
│   └── db/              # Shared DB schema (Drizzle ORM)
├── turbo.json
└── package.json
```

### Mobile: React Native + Expo

```
apps/mobile/
├── src/
│   ├── screens/
│   ├── components/
│   ├── native-modules/     # WiFi Direct (Android), MultipeerConnectivity (iOS)
│   └── services/
├── android/                # Kotlin WiFi Direct bridge
├── ios/                    # Swift MultipeerConnectivity bridge
└── app.json
```

Key libraries:
- `expo` SDK 51+ — managed workflow
- `expo-file-system` — file I/O
- `expo-sqlite` — local DB
- `expo-background-fetch` — receive while screen locked
- `react-native-wifi-p2p` — WiFi Direct Android (or custom native module)
- `react-native-multipeer` — iOS MultipeerConnectivity
- `@react-native-community/netinfo` — network detection

Native modules to write:
- Android: `WifiP2pManager` wrapper in Kotlin → RN bridge
- iOS: `MCSession` wrapper in Swift → RN bridge

### Desktop: Electron

```
apps/desktop/
├── src/
│   ├── main/
│   │   ├── transfer/      # HTTP/2 server, mDNS, WiFi Direct
│   │   ├── rooms/         # Room state management
│   │   └── ipc/           # IPC handlers
│   └── renderer/          # React UI (shared with web)
└── electron.vite.config.ts
```

Key libraries:
- `electron-vite` — Vite-powered Electron + HMR
- `multicast-dns` — mDNS device discovery
- `node-wifi` — WiFi management
- `better-sqlite3` — local SQLite (sync, fast)
- `electron-updater` — auto updates

### Web / PWA: Next.js 15

```
apps/web/
├── app/
│   ├── (marketing)/       # Landing, product pages
│   ├── room/[id]/         # Room view
│   ├── send/              # Send interface
│   └── api/
│       ├── signal/        # WebRTC signaling WebSocket
│       └── relay/         # Cloud rescue endpoint
└── next.config.ts
```

Key libraries:
- `next` 15 App Router
- `simple-peer` — WebRTC DataChannels
- `socket.io-client` — signaling
- `idb` — IndexedDB for transfer state in browser
- `next-pwa` — PWA manifest + service worker

### Relay / Signaling Server: Node.js + Fastify

```
apps/relay/
├── src/
│   ├── signaling.ts       # WebRTC offer/answer/ICE
│   ├── relay.ts           # Cloud rescue byte relay
│   ├── rooms.ts           # Room presence (Redis pub/sub)
│   ├── hashtag.ts         # Hashtag room resolution
│   └── index.ts
└── package.json
```

Key libraries:
- `fastify` — HTTP server
- `@fastify/websocket` — WebSocket signaling
- `ioredis` — Redis for room presence + relay sessions
- `jose` — JWT room tokens

### Shared Core Package

```
packages/core/
├── src/
│   ├── chunker.ts         # File chunking + reassembly
│   ├── checksum.ts        # SHA-256 verification
│   ├── protocol.ts        # Handshake message types
│   ├── discovery.ts       # mDNS + device fingerprint
│   ├── resume.ts          # Byte offset tracking
│   └── encryption.ts      # X25519 + AES-256-GCM
└── package.json
```

Imported by mobile, desktop, and web. Transfer logic written once.

---

## 10. Database

### Local (per device): SQLite

- Mobile: `expo-sqlite`
- Desktop: `better-sqlite3`
- ORM: Drizzle ORM (TypeScript-first, works with SQLite + Postgres)

```typescript
// packages/db/schema.ts
export const devices = sqliteTable('devices', {
  id: text('id').primaryKey(),           // UUID
  name: text('name').notNull(),          // "Ripple" or user-set name
  otterName: text('otter_name'),         // auto-assigned Scout/Ripple/Dash
  publicKey: text('public_key').notNull(),
  platform: text('platform').notNull(),  // android|ios|windows|mac|browser
  lastSeen: integer('last_seen'),
  avatarColor: text('avatar_color'),
  isSaved: integer('is_saved').default(0), // 0=seen, 1=saved/trusted
});

export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  hashtag: text('hashtag'),              // null for QR/PIN rooms
  createdAt: integer('created_at'),
  role: text('role').notNull(),          // sender|receiver|both
  isLocal: integer('is_local').default(1), // 1=LAN only, 0=relay-enabled
});

export const transfers = sqliteTable('transfers', {
  id: text('id').primaryKey(),
  roomId: text('room_id'),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  checksum: text('checksum'),
  bytesReceived: integer('bytes_received').default(0),
  status: text('status').notNull(),      // pending|transferring|complete|failed|queued
  direction: text('direction').notNull(), // sent|received
  timestamp: integer('timestamp'),
  peerId: text('peer_id'),
  mode: text('mode'),                    // local|relay
});

export const hashtags = sqliteTable('hashtags', {
  tag: text('tag').primaryKey(),         // #weddingcrew
  lastUsed: integer('last_used'),
  useCount: integer('use_count').default(1),
});
```

### Cloud (relay server): PostgreSQL + Redis

- PostgreSQL: Room memberships, user accounts, relay session logs (Supabase managed)
- Redis: Room presence (who's live now), relay buffer for in-flight rescue, hashtag-to-session mapping
- Host: Supabase (Postgres + Auth) + Upstash (Redis serverless)

---

## 11. Authentication

### Local transfers: No auth ever
Device fingerprint (UUID + public key pair, generated on first launch) is the identity. No login, no email required for any local P2P transfer.

### Cloud features (relay, cross-network rooms): Optional OAuth
- Provider: Supabase Auth (Google OAuth + Apple Sign In + magic link)
- Auth is never required to send a file
- Unlocks: persistent rooms across networks, device sync across own devices, cloud rescue, transfer history sync

**Email collection strategy:**
- Install → never ask
- First transfer → never ask
- User taps "Save this room permanently" → ask (value is obvious)
- User taps "Enable cloud rescue" → ask
- User taps "Sync devices across my phones" → ask
This is the opposite of Blip. Local-first = more installs, better conversion moment.

---

## 12. Device Naming — Otter Personas

**Strategy: Auto-assign + let users rename**

Every device gets an otter persona on first launch — deterministic from device fingerprint (same device = always same name). User can rename anytime with one tap. Most won't. Both groups happy.

**Name pool: Water + Action combos**
```
Scout    Ripple   Dash     Tide     Drift
Current  Shore    Wave     Reef     Pearl
Brook    Crest    Eddy     Flow     Gust
```

Single word, memorable, water-themed, ties to OTO/otter brand universe.

**In UI:** Each device gets a small otter avatar (deterministic color from fingerprint). When transferring, animate otter swimming toward the target. Screenshot-worthy moment that gets shared.

**URL format:** `drop.oto.direct` shows radar with otter names and colored avatars for nearby devices.

---

## 13. Hashtag Rooms

The hashtag IS the room. No invite link, no QR scan, no PIN to remember. Both type the same hashtag → same room.

**Core mechanic:**
```
Sid types    #weddingcrew  →  joins room
Arjun types  #weddingcrew  →  same room instantly
```

**URL:** `drop.oto.direct/#weddingcrew`
Share the URL = share the hashtag = share the room.

**Collision prevention:**
- Same LAN: proximity is the salt. Two strangers using #party on different networks never end up in same room.
- Cross-network: hashtag + account ID = unique room. #weddingcrew resolves differently for each creator unless they explicitly share the exact join URL.
- Optional: 4-digit PIN on top of hashtag for sensitive rooms.

**Hashtag tiers:**
| Type | Example | Behaviour |
|---|---|---|
| Moment | #drop | Expires 2hrs, anyone nearby on LAN |
| Personal | #sid | Yours with account, persistent |
| Group room | #weddingcrew | Invite-only, persistent |
| Event (paid) | #tedxpune2025 | Public, time-limited, 1000+ devices |

**Does hashtag need internet?**
- Same LAN: No. mDNS resolves locally.
- Different networks: Yes. Relay matches the hashtag to a session.

**Presence indicator:** When you type a hashtag, show a pulse — "3 devices in #weddingcrew right now" — without revealing who. Feels alive.

**History chips:** Every hashtag you've used appears as a chip on home screen. Tap #gymgang → instantly back in. Zero re-entry.

---

## 14. Rooms System

**A Room is a named trust relationship between devices, not a session.**

### Room types:
- **LAN room:** Works offline on same network. No relay needed.
- **Relay room:** Works across networks. Internet required. Needs account.
- **Hashtag room:** Identified by hashtag, either LAN or relay.

### Room mechanics:
- **Join once:** QR or PIN or hashtag → stored on device → never need to join again
- **Auto-connect:** When sender opens room, devices that are online in range auto-connect
- **Roles:** sender-only, receiver-only, or both — set per member
- **Offline queue:** Files held for offline members, delivered on reconnect (24hr free, 7 days Pro)
- **Admin approval:** Off by default (QR/PIN is the trust gate). Toggleable per room.
- **Presence:** See who's live now (green dots) before sending
- **History:** Full log of who sent what, when — searchable

### Room use cases:
- Teacher creates "Physics 101" → shares PIN once → students never re-join
- Photographer creates "Wedding Set A" → all crew auto-join on arrival at venue
- Friend group has "#tripgoa" → share pics anytime from anywhere

---

## 15. Full Feature List

### Core Transfer
- Chunked resumable transfer (picks up from exact byte on reconnect)
- Parallel multi-file streaming (all files simultaneously, not queued)
- Transfer queue (files wait if receiver busy)
- Selective folder browser (receiver cherry-picks files from sender)
- Compression toggle (skip for RAW/MP4, use for docs/folders)
- Transfer speed cap (don't choke shared WiFi)
- SHA-256 verification on every transfer

### Discovery & Pairing
- mDNS auto-discovery (same network, no action needed)
- WiFi Direct auto-negotiation (no router, no hotspot setup)
- QR pairing (stranger's device, instant)
- PIN join (group rooms)
- Hashtag rooms (#tag = room)
- NFC tap-to-pair (Android, triggers WiFi Direct handshake)
- Proximity radar UI (spatial map of nearby devices)

### Device Identity
- Otter persona auto-naming (Scout, Ripple, Dash — deterministic)
- One-tap rename
- Device avatar (color from fingerprint)
- Save device (remember after first transfer)
- Cross-device sync (saved devices sync across own phones — Pro + account)

### Rooms
- Named persistent rooms
- Hashtag rooms
- Roles per member (sender / receiver / both)
- Guest join (temp access via QR, auto-removed after)
- Room presence indicator (who's live now)
- Offline delivery queue
- Room transfer history + search
- Receive-only drop box mode
- Scheduled broadcast (queue file for 9am tomorrow)
- Room capacity limits (free: 5, Pro: unlimited)

### Receive Experience
- Approval prompt with file preview (name, size, type) before accepting
- Batch approve / reject
- Auto-sort on receive (by sender or file type)
- Receive while screen locked (background service)
- Auto-delete from sender after confirmed receive (move mode)

### Storage Bridge (Phase 4)
- External drive broadcasting (plug HDD → app serves directory wirelessly)
- SD card reader mode
- Directory browser (receiver sees sender's folder tree, pulls specific files)
- Watched folder (auto-send anything dropped into /OTODrop/AutoSend/)
- Storage health display (warns if receiver space is low)

### Live & Collaborative
- Live progress dashboard (sender sees all receivers' bars in real time)
- Clipboard sync (copy on phone, paste on laptop — same room)
- Live photo preview (thumbnail appears as file downloads)
- Shared transfer link (URL anyone can use to pull from your device)

### Rescue & Fallback
- Cloud rescue relay (connection drops mid-transfer → opt-in cloud continuation)
- 24hr encrypted temp locker (receiver offline → gets it when back)
- USB cable fallback prompt (no wireless available → guides to cable)
- SMS/WhatsApp fallback (receiver has no app → temp download link via message)
- Mode indicator (always shows: Local / Relay / Offline)

---

## 16. User Flow — Happy Path (Minimum Clicks)

**Sender: 3 taps**
1. Open app → radar shows devices
2. Tap device (or hashtag room)
3. Select file → Confirm send

**Receiver: 1 tap**
1. Tap Accept on approval prompt

**Total friction:** 4 taps between two people to transfer any file at 100 MB/s. This is the design constraint. Every feature must be built around preserving this.

---

## 17. What Needs to Be Running

| Situation | WiFi needed | Cellular needed | Internet needed |
|---|---|---|---|
| Same room, same WiFi | Yes (or WiFi Direct) | No | No |
| Same room, no WiFi | No — app creates WiFi Direct | No | No |
| Same room, different networks | Either | Either | No (WiFi Direct) |
| Different cities | Either | Either | Yes |
| One person offline | — | — | They get it on reconnect |

User never has to toggle anything. App handles it.

---

## 18. URL Architecture

```
oto.direct/                    # Marketing homepage
oto.direct/drop                # OTODrop product page
oto.direct/share               # OTOShare product page
oto.direct/pricing             # Unified pricing
oto.direct/blog                # Content SEO

drop.oto.direct/               # OTODrop PWA (web app)
drop.oto.direct/r/abc123       # Room join link
drop.oto.direct/#weddingcrew   # Hashtag room join

share.oto.direct/              # OTOShare web app (Firebase, existing)
share.oto.direct/f/xyz789      # Shared file link

api.oto.direct/                # Unified API (future)
relay.oto.direct/              # WebSocket relay (internal)
```

**Domain to buy:** oto.direct (~$25/yr at Namecheap)
**Second choice:** useoto.com (~$12/yr, safer conventional option)

---

## 19. Build Sequence

### Phase 1 — Browser MVP (4 weeks)
Goal: Prove transfer works. Get first users.
- WebRTC transfer between two browser tabs / devices on same WiFi
- Real-time progress bar
- QR / PIN pairing only
- No auth, no rooms, no accounts
- Deploy to drop.oto.direct via Vercel
- Relay to Railway

### Phase 2 — Native Speed (6 weeks)
Goal: Beat Blip on speed benchmarks. Publish numbers.
- Electron desktop app (Win + Mac)
- WiFi Direct on Android via native Kotlin module
- mDNS auto-discovery (no QR on same LAN)
- Local SQLite transfer history
- Resumable transfers
- Otter device naming

### Phase 3 — Rooms + Social (6 weeks)
Goal: Daily-use habit loop. Not just a tool.
- Persistent named rooms
- Hashtag rooms
- Group broadcast 1→N
- Offline delivery queue
- Clipboard sync
- Room transfer history

### Phase 4 — iOS + Storage Bridge (4 weeks)
- MultipeerConnectivity on iOS
- External drive directory browsing
- Cross-platform rooms (Android ↔ iOS via relay)
- Cloud rescue mode

### Phase 5 — Monetisation
- Pro tier: unlimited rooms, transfer history, relay priority, device sync
- Team tier: admin, audit log, white-label rooms
- Event license: 100+ device rooms, custom branding

---

## 20. Monetisation

**Free tier:**
- Unlimited local P2P transfers (always free, no cap)
- Rooms up to 3 devices
- No transfer history
- No cloud rescue
- No relay mode

**Pro ($4.99/mo or $39/yr):**
- Unlimited room size
- Transfer history (30 days)
- Cloud rescue fallback
- Clipboard sync
- Device sync across own phones
- Permanent hashtags
- Offline queue: 7 days

**Team ($12/mo per seat):**
- Multiple rooms with admin control
- Receive-only roles
- Audit log + export
- White-label room names
- Priority relay routing
- Transfer history: 1 year

**Event License (one-time, $49–$199):**
- 100–1000 device rooms
- Custom room branding
- Sold to: wedding companies, conference AV, production houses, education orgs

**Unit economics advantage:** 99% of usage is local P2P. Server never sees file data. You pay $0 bandwidth per local transfer. Dropbox pays for every byte. This is a fundamentally better cost structure as you scale.

---

## 21. Hosting & Deployment

| Service | Purpose | Cost |
|---|---|---|
| Vercel | Next.js PWA | $0 (free tier) |
| Railway / Fly.io | Relay + signaling WebSocket | $5–20/mo |
| Supabase | PostgreSQL + Auth | $0 (free tier) |
| Upstash | Redis (room presence) | $0 (free tier) |
| GitHub Actions | CI/CD | $0 |
| Expo EAS | Mobile builds | $0–29/mo |

**Total infra cost early stage: $5–25/month.**

**Deployment pipeline:**
- PWA: GitHub push → Vercel auto-deploy
- Relay: Dockerfile → Railway auto-deploy (WebSocket autoscale)
- Mobile: Expo EAS Build → Play Store + App Store
- Desktop: GitHub Actions → electron-builder → GitHub Releases with auto-update

**Distribution:**
- Android: Play Store + direct APK (power users use APK, like LocalSend)
- iOS: App Store only
- Desktop: GitHub Releases + oto.direct/download
- Web: drop.oto.direct — zero install, universal fallback

---

## 22. Encryption

- **Key exchange:** X25519 ECDH — keypair generated per device on first launch, public key shared during handshake
- **Transfer encryption:** AES-256-GCM per chunk
- **Room tokens:** JWT RS256 signed by relay
- **Library:** `@noble/curves` + `@noble/ciphers` (pure TypeScript, works everywhere)
- **UI:** Show a visible padlock + "Encrypted" indicator during transfer. Make security legible, not hidden.

---

## 23. Performance Targets

| Metric | LocalSend | Blip | AirDrop | Target |
|---|---|---|---|---|
| LAN transfer speed | 20 MB/s | 40 MB/s | 60 MB/s | **100+ MB/s** |
| WiFi Direct speed | N/A | ~40 MB/s | 60 MB/s | **80–120 MB/s** |
| Resume on drop | No | Yes | No | **Yes** |
| Group 1→N send | No | No | No | **Yes** |
| Browser support | No | No | No | **Yes** |

Speed is an engineering decision, not hardware. Bottleneck is chunk size, parallel streaming, and not compressing already-compressed files (RAW, MP4). Parallel 1MB chunks over HTTP/2 with zero overhead gets you there.

---

## 24. Cursor Initial Prompt

Feed this to Cursor after creating the repo:

```
Initialize a Turborepo monorepo called "oto-drop" with pnpm workspaces.

Create the following apps:

1. apps/mobile — React Native with Expo SDK 51, TypeScript strict mode,
   expo-router for navigation, expo-sqlite for local DB, NativeWind for styling.
   Include placeholder native module folders: android/modules/WifiDirect (Kotlin),
   ios/modules/MultipeerBridge (Swift).

2. apps/desktop — Electron with electron-vite, React 19, TypeScript strict,
   better-sqlite3. Renderer shares components with web via @oto/ui package.

3. apps/web — Next.js 15 App Router, TypeScript strict, Tailwind CSS, next-pwa.
   Include API routes: app/api/signal/route.ts (WebSocket placeholder),
   app/api/relay/route.ts (placeholder).

4. apps/relay — Node.js with Fastify, TypeScript, @fastify/websocket, ioredis.
   Entry: src/index.ts. Hot reload via tsx watch.

Create the following packages:

1. packages/core — Pure TypeScript, no framework dependencies.
   Export from src/index.ts:
   - chunker.ts: splitFile(buffer: ArrayBuffer, chunkSize?: number): Uint8Array[]
     and reassemble(chunks: Uint8Array[]): ArrayBuffer
   - checksum.ts: sha256(data: ArrayBuffer): Promise<string> using Web Crypto API
   - protocol.ts: TypeScript types — DeviceInfo, SessionOffer, ChunkAck, TransferComplete
   - discovery.ts: generateDeviceId(): string, generateOtterName(id: string): string
     (deterministic otter name from pool: Scout, Ripple, Dash, Tide, Drift, Current,
     Shore, Wave, Reef, Pearl, Brook, Crest, Eddy, Flow, Gust)

2. packages/ui — React component library with Tailwind.
   Export: Button, ProgressBar, DeviceCard (shows otter name + avatar color),
   RoomBadge, HashtagChip components.

3. packages/db — Drizzle ORM.
   SQLite schema for: devices, rooms, transfers, hashtags tables.
   devices: id, name, otterName, publicKey, platform, lastSeen, avatarColor, isSaved
   rooms: id, name, hashtag, createdAt, role, isLocal
   transfers: id, roomId, fileName, fileSize, checksum, bytesReceived, status,
              direction, timestamp, peerId, mode
   hashtags: tag, lastUsed, useCount
   Export migration utils and schema types.

Root turbo.json tasks: dev, build, lint, test with proper caching.

Shared ESLint + Prettier config in packages/eslint-config.
TypeScript project references.
Path aliases: @oto/core, @oto/ui, @oto/db.

Each app dev script supports hot reload:
- mobile: expo start
- desktop: electron-vite dev
- web: next dev
- relay: tsx watch src/index.ts

Do not add transfer logic, auth, or database connections yet.
Just the scaffold, configs, and typed empty exports.
```

---

## 25. Local Development & Testing

### Prerequisites
```bash
node >= 20
pnpm >= 9
Android Studio (Android emulator)
Xcode (iOS simulator, Mac only)
```

### First time setup
```bash
git clone <repo>
cd oto-drop
pnpm install
pnpm db:generate          # generate Drizzle migrations
```

### Hot reload — all services

```bash
# Terminal 1 — Relay (restarts on save)
cd apps/relay && pnpm dev     # tsx watch

# Terminal 2 — Web PWA
cd apps/web && pnpm dev       # next dev, HMR instant

# Terminal 3 — Desktop (Electron)
cd apps/desktop && pnpm dev   # electron-vite, HMR in renderer, nodemon in main

# Terminal 4 — Mobile
cd apps/mobile && pnpm start  # expo start → 'a' Android, 'i' iOS
```

### Test local P2P (two browser tabs)
```bash
# web runs on localhost:3000
# Open two windows → they discover each other via localhost relay
# Real WebRTC DataChannel transfer — works for full dev loop
```

### Test on real devices (same WiFi)
```bash
cd apps/web
NEXT_PUBLIC_HOST=0.0.0.0 pnpm dev
# Find machine IP: ipconfig (Win) / ifconfig (Mac)
# Open http://192.168.x.x:3000 on phone
# mDNS discovery works on same LAN
```

### Test WiFi Direct (no router)
```bash
# Two Android devices with Expo Go
expo start --tunnel         # Uses ngrok for signaling relay
# Actual data still goes device-to-device via WiFi Direct native module
```

---

## 26. Environment Variables

```env
# apps/relay/.env
PORT=4000
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_here
RELAY_MAX_FILE_MB=500
QUEUE_EXPIRY_HOURS=24

# apps/web/.env.local
NEXT_PUBLIC_RELAY_URL=ws://localhost:4000
NEXT_PUBLIC_APP_NAME=OTODrop
NEXT_PUBLIC_APP_VERSION=0.1.0

# apps/desktop/.env
RELAY_URL=ws://localhost:4000

# apps/mobile (app.json extra)
# RELAY_URL configured in app.config.ts
```

---

*OTODrop PRD v2.0 — All decisions consolidated*
*Ready for Cursor scaffold + design brief*
*Next: Screen-by-screen UX flows and wireframes*
