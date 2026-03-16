# Goal Tracker

Goal Tracker is a React, TypeScript, and Vite application for tracking recurring goals across days, weeks, and months. The app now uses a single internal storage model backed by IndexedDB in both the web build and the Capacitor native wrapper.

## Development

Install dependencies and start the app:

```bash
npm install
npm run dev
```

Useful commands:

```bash
npm run lint
npm run build
npm run preview
```

## Architecture

- `src/App.tsx` initializes storage, loads goals, and switches between month and day views.
- `src/store/app.store.ts` is the main Zustand store and persists goal changes.
- `src/services/storage.service.ts` provides the internal storage adapter.
- `src/services/indexedDbStorage.service.ts` reads and writes goal data in IndexedDB.
- `src/services/fileSystem.service.ts` parses and serializes markdown/frontmatter for stored goal content.

## Native Wrapper

The repository includes a Capacitor wrapper for Android and iOS.

Useful commands:

```bash
npm run cap:sync
npm run cap:android
npm run cap:ios
npm run cap:open:android
npm run cap:open:ios
```

Current native behavior:

- Android native uses the same internal storage flow as the web app.
- iOS native uses the same internal storage flow as the web app.
- iOS project generation and sync work from this repo, but building and signing still require a Mac with Xcode.

## Deployment Notes

- Android project files live under `android/`.
- iOS project files live under `ios/`.
- Capacitor configuration lives in `capacitor.config.ts`.
- Before store submission, update the app identifier in `capacitor.config.ts` to a reverse-DNS identifier you control.
