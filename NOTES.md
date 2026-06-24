# NOTES.md — Pulse Take-Home Assessment

## Phase 1 — Make it Run

### Bugs Found & Fixed

**Bug 1 — Heartbeat updated ALL users instead of just the caller**
- File: `app/api/poll/route.ts`
- The `updateMany` had `where: {}` which refreshed every presence row on every poll, meaning dots never went stale and stayed on the map forever even after users left.
- Fix: Changed to `where: { id }` to only heartbeat the current user.

**Bug 2 — Chat messages never arrived**
- File: `lib/webrtc.ts`
- `sendChat` was sending `{ t: "msg" }` but the receiver was checking for `{ t: "chat" }` — a simple typo that broke all chat.
- Fix: Changed `t: "msg"` to `t: "chat"`.

**Bug 3 — Busy flag never cleared on disconnect**
- File: `app/api/signal/route.ts`
- The `end` signal type never reset `busy: false` for either peer, so after a conversation ended both users were permanently marked as busy and couldn't connect to anyone else.
- Fix: Added `signalType === "end"` to the decline condition that resets busy to false.

**Additional — Mapbox replaced with MapLibre/MapTiler**
- Mapbox requires a credit card for account creation even on the free tier. As I only have access to GCash and local Philippine bank cards (not accepted by Mapbox), I switched to MapLibre GL JS (the open-source fork of Mapbox GL JS) with MapTiler as the tile provider.
- The API is nearly identical and the map functionality, styling, and performance are equivalent.
- MapTiler API key is configured in Vercel environment variables for the live deployment.

**Known Limitation — WebRTC Connectivity**
- WebRTC uses STUN + public TURN servers. On strict networks or certain ISPs (common in the Philippines), peer connections may fail to establish. This is a known limitation noted in the original README.
- Added multiple Google STUN servers and OpenRelay TURN servers to improve connectivity.
- A production deployment would use a dedicated TURN server (e.g. Twilio Network Traversal Service or Coturn) for fully reliable connectivity.

---

## Phase 2 — Make it Good

### Changes Made

- **EntryGate** — Full redesign with animated background orbs, grid overlay, pulsing dot logo, mood picker with Lucide icons, and smooth fade-in animation on mount.
- **ChatPanel** — Glassmorphism sidebar with slide-in animation, gradient message bubbles, animated empty state, smooth scrollbar, bouncing typing indicator dots, and reaction picker.
- **ConnectionPrompt** — Modal with blur backdrop, scale + fade animation, pulsing green dot icon.
- **VideoPanel** — Full-screen remote video with picture-in-picture local feed, mute toggle button, live indicator badge, and gradient controls bar.
- **WorldMap** — Switched to MapLibre, glowing pulsing dot markers with mood emoji badges, styled "Me" pin, highlighted online count.
- **globals.css** — Custom scrollbar, enhanced dot pulse animation with glow effect, MapLibre CSS import.
- **Font** — Switched to DM Sans from Google Fonts for a cleaner, more modern feel.

### Design Decisions
- Kept the dark zinc/emerald color palette from the original but made it more intentional and polished.
- Used glassmorphism (backdrop-blur + semi-transparent backgrounds) throughout for depth.
- All animations use CSS transitions or keyframes — no heavy animation libraries needed.
- Used Lucide React for all icons — consistent, clean, and lightweight.

---

## Phase 3 — Make it Secure

### Issues Found & Prioritized

**Critical**
1. **No rate limiting** — Any IP could spam `/api/join`, `/api/signal`, and `/api/poll` thousands of times per second, flooding the database.
2. **Unverified `fromId`** — The signal API accepted any `fromId` without checking if that session actually exists, allowing anyone to forge signals pretending to be another user.

**High**
3. **No self-signaling prevention** — A user could send signals to themselves causing unexpected state.
4. **No presence cap** — No limit on how many rows could be inserted into the presence table, allowing DB flooding.

**Medium**
5. **No input length validation on IDs** — Already partially handled but tightened.

### Fixes Applied
- Added in-memory rate limiting via `lru-cache` for all three API routes (join: 10/min, signal: 500/min, poll: 60/min per IP).
- Added sender verification — `/api/signal` now checks that `fromId` exists in the presence table before processing.
- Added self-signal prevention — returns 400 if `fromId === toId`.
- Added presence cap — rejects joins if presence table exceeds 10,000 rows.
- Added ID length validation on signal route.

### Trade-offs
- Rate limiting is in-memory (resets on server restart). A production system would use Redis (e.g. Upstash). Chose in-memory to avoid adding external dependencies for this assessment.
- The sender verification adds one extra DB query per signal but is worth the security guarantee.

---

## Phase 4 — Make it Better

### Features Built

**1. Mood / Vibe Indicator**
- On the entry gate, users pick a mood from 8 options using Lucide icons (Just saying hi, Want to talk, Listening to music, Can't sleep, Having coffee, Taking a break, Deep in thought, Feeling happy).
- The mood is stored in the `Presence` table (added `mood` field via Prisma migration).
- Each dot on the map shows the corresponding emoji badge so you can choose WHO to connect with based on vibe.
- Makes the map feel human and alive — you're not just clicking random dots, you're connecting with intent.

**2. Typing Indicator**
- When a user types in the chat input, a `{ t: "typing", isTyping: true }` message is sent over the WebRTC data channel (never touches the server).
- The other peer sees animated bouncing dots with "Stranger is typing…" above the input.
- Clears automatically when the user stops typing or sends a message.

**3. Message Reactions**
- Tap the SmilePlus icon next to any message to react with an emoji (❤️ 😂 👍 😮 😢).
- Reactions are sent peer-to-peer over WebRTC — never stored on the server.
- Both users see the reaction appear on the message in real time.
- Supports long press on mobile for better UX.

**4. End Conversation Warning**
- Clicking "End" shows a custom-designed confirmation modal instead of the browser's default `window.confirm()`.
- Prevents accidental disconnections.

### What I'd Do Next With More Time
- Add a dedicated TURN server for reliable WebRTC connectivity on all networks.
- Add conversation starter prompts (random icebreaker questions when chat opens).
- Add anonymous post-conversation reactions (👍 great chat, ❤️ felt a connection).
- Add swipe-to-reply on messages for a more natural mobile chat experience.
- Replace in-memory rate limiting with Redis for production reliability.
- Add WebSocket support when not on Vercel serverless for lower latency.
- Add a heatmap layer showing where the most active conversations are happening globally.