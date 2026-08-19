# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chafadia Noor is an all-in-one Muslim guide mobile app built with **Expo SDK 54** and **React Native 0.81**. It provides Islamic tools and a social platform: prayer times with Qibla direction, Quran reader, Hadith, Dua, Tasbeeh counter, Ramadan tracker, Islamic calendar, Arabic learning, mosque finder, community posts, real-time messaging, AI assistant, courses, articles, and downloads.

## Commands

```bash
npm install --legacy-peer-deps   # Install dependencies (plain `npm install` fails: react-i18next's
                                  # peer range conflicts with the pinned typescript@~6.0.3 devDependency)
npx expo start           # Start dev server (Expo Go)
npx expo start --dev-client  # Start with dev client (custom native modules)
npx expo start -c        # Start with cache cleared
npx expo run:android     # Build and run on Android
npx expo run:ios         # Build and run on iOS
npx expo lint            # Run ESLint (expo flat config)
```

Backend (`server/`):
```bash
cd server
npm install
npm run migrate          # apply pending SQL files in server/migrations/
npm run dev               # nodemon server.js (local dev)
npm start                 # node server.js (production)
```

Admin panel (`admin/`, React + Vite):
```bash
cd admin
npm install
npm run dev
```

## Architecture

### Routing

Uses **expo-router** with file-based routing. All screens live under `src/app/`. The root `src/app/index.tsx` redirects to `src/app/auth/LoadingScreen`. The root layout (`src/app/_layout.tsx`) is a headerless `<Stack>`. The auth flow has its own layout at `src/app/auth/_layout.tsx` wrapping screens in `GestureHandlerRootView` + `SafeAreaProvider`.

Each feature is a directory with an `index.tsx` (e.g., `src/app/quran/index.tsx`, `src/app/prayertimes-qibla/index.tsx`). There are no shared component files or hooks directories yet; screens are self-contained with inline `StyleSheet.create` styles.

### Backend

The real backend is a custom **Node/Express + Socket.io + PostgreSQL** server in `server/` (entry point `server/server.js`, default port 5000). JWT-based auth (`server/middleware/auth.js`), REST routes in `server/routes/*.js` with matching `server/controllers/*.js`, SQL schema applied via numbered files in `server/migrations/` (run with `npm run migrate` from `server/` — see `server/DEPLOY.md` for deploying it publicly so real devices on different networks can reach it). Real-time features (chat messages, typing, presence, WebRTC call signaling) go through Socket.io (`server/config/socket.js`).

The mobile app talks to it via `src/api/client.js` (axios, base URL from `EXPO_PUBLIC_API_URL`) and `src/api/socket.js` (socket.io-client, base URL from `EXPO_PUBLIC_SOCKET_URL`). **Both must point at a server reachable from the physical device** — `localhost`/`10.0.2.2` only work inside iOS simulators/Android emulators.

`src/firebase/**` (auth.js, firestore.js, messaging.js, realtime.js, storage.js) is a **complete but unused** parallel Firebase implementation — nothing under `src/app/**` imports it. Treat it as dead code / a future migration target, not the active backend, unless you're deliberately switching architectures.

### Localization

Uses **i18next** + **react-i18next**. Translation files are in `src/localization/` as JSON (en, ar, fr, ha, sw, ur, tr, id). The i18n instance is configured in `src/localization/i18n.js`; language preference is persisted to AsyncStorage under the key `user-language`. The `src/localization/index.js` exports a simpler `getTranslation()` helper and the `supportedLanguages` list.

### Static Assets

Images and sounds are in `src/assets/images/` and `src/assets/sounds/`. Asset references are centralized in `src/constants/imagePath.ts` using `require()` calls with the `@/` path alias.

### Key Libraries

- **adhan** — prayer time calculation and Qibla direction
- **expo-location** — GPS for prayer times and mosque finder
- **expo-notifications** — prayer time reminders
- **expo-av** — audio playback (azan, Quran recitation)
- **lucide-react-native** — icon set used across all screens
- **expo-linear-gradient** — gradient backgrounds (app uses green/emerald Islamic theme)
- **zustand** — state management
- **react-native-maps** — mosque finder map
- **dayjs** — date/time formatting
- **yup** + **react-hook-form** — form validation

### Configuration

- TypeScript is configured with `strict: false` and `@/*` path alias mapping to project root
- `app.json` is the canonical Expo config (New Architecture enabled, typed routes experiment enabled)
- ESLint uses the Expo flat config (`eslint-config-expo/flat`)
- App scheme: `chafadianoor`
- Bundle ID: `com.chafadianoor.app`
