# Goal Tracker

A beautiful, cross-platform goal tracking application built with React, TypeScript, and Capacitor. Track your goals with calendar views, sync with external markdown files, and stay organized across all your devices.

## Features

- 📅 **Calendar View** - Visualize your goals and progress month by month
- 📝 **Markdown Files** - Goals stored as markdown files, compatible with Obsidian
- 🔄 **Sync Support** - Works with Syncthing or similar tools to sync across devices
- 🌙 **Dark Theme** - Beautiful dark UI with customizable themes
- 📱 **Cross-Platform** - Runs on Web, Android, and iOS
- 💾 **Flexible Storage** - Choose between external folder sync or in-app storage

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- For Android: Android Studio with SDK 34+
- For iOS: Xcode 15+ and macOS

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd goal_tracker/app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development

```bash
# Run web development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Native App Development

### Android

```bash
# Build and sync with Android
npm run build:android

# Open in Android Studio
npm run cap:open:android

# Run on connected device/emulator
npm run cap:run:android
```

### iOS

```bash
# Build and sync with iOS
npm run build:ios

# Open in Xcode
npm run cap:open:ios

# Run on connected device/simulator
npm run cap:run:ios
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run cap:sync` | Sync web assets with native platforms |
| `npm run cap:copy` | Copy web assets without plugin updates |
| `npm run cap:open:android` | Open Android project in Android Studio |
| `npm run cap:open:ios` | Open iOS project in Xcode |
| `npm run cap:run:android` | Build and run on Android |
| `npm run cap:run:ios` | Build and run on iOS |
| `npm run build:android` | Build web + sync Android |
| `npm run build:ios` | Build web + sync iOS |
| `npm run build:native` | Build web + sync all platforms |

## Project Structure

```
app/
├── android/                 # Android native project (Capacitor)
├── ios/                     # iOS native project (Capacitor)
├── src/
│   ├── components/          # React components
│   │   ├── calendar/        # Calendar views
│   │   ├── goals/           # Goal management
│   │   ├── vault/           # Storage setup
│   │   └── ui/              # Reusable UI components
│   ├── services/            # Business logic
│   │   ├── storage.service.ts           # Unified storage adapter
│   │   ├── platform.service.ts          # Platform detection
│   │   ├── capacitorFileSystem.service.ts  # Native file access
│   │   ├── nativeFileSystem.service.ts  # Web File System API
│   │   └── indexedDbStorage.service.ts  # In-app storage
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Zustand state management
│   ├── types/               # TypeScript types
│   └── utils/               # Utility functions
├── capacitor.config.ts      # Capacitor configuration
├── vite.config.ts           # Vite configuration
└── package.json
```

## Storage Modes

The app supports multiple storage modes depending on the platform:

### 1. External Folder (Android/Web PWA)
- Select your Goals folder (e.g., Syncthing/Goals)
- Goals stored as markdown files
- Perfect for syncing across devices
- Full compatibility with Obsidian

### 2. In-App Storage (All Platforms)
- Goals stored within the app using IndexedDB
- No external permissions needed
- Best for iOS or standalone use

### Platform Support

| Feature | Web (Chrome) | Android | iOS |
|---------|--------------|---------|-----|
| External Folder | ✅ (File System Access API) | ✅ (Native Storage) | ❌ (Sandboxed) |
| In-App Storage | ✅ | ✅ | ✅ |
| PWA Install | ✅ | ✅ (via Chrome) | ⚠️ (Safari only) |
| Native App | N/A | ✅ | ✅ |

## Building for App Stores

### Android (Play Store)

1. **Configure signing:**
   ```bash
   cd android
   # Create/edit gradle.properties with your keystore info
   ```

2. **Build release APK:**
   - Open Android Studio: `npm run cap:open:android`
   - Build > Generate Signed Bundle/APK
   - Choose APK or Android App Bundle

3. **Test the release build:**
   ```bash
   adb install android/app/build/outputs/apk/release/app-release.apk
   ```

### iOS (App Store)

1. **Configure signing:**
   - Open Xcode: `npm run cap:open:ios`
   - Select your team in Signing & Capabilities
   - Configure bundle identifier

2. **Build for App Store:**
   - Product > Archive
   - Distribute App > App Store Connect

## Configuration

### Environment Variables

Create a `.env` file in the app directory:

```env
# Path to Goals folder for development
VITE_GOALS_PATH=../Goals
```

### Capacitor Configuration

Edit `capacitor.config.ts` to customize:

```typescript
const config: CapacitorConfig = {
  appId: 'com.yourcompany.goaltracker',  // Change for your app
  appName: 'Goal Tracker',
  webDir: 'dist',
  // ... other options
};
```

## Android Permissions

The app requests these permissions on Android:

- `READ_EXTERNAL_STORAGE` - Read goal files
- `WRITE_EXTERNAL_STORAGE` - Save goal changes
- `MANAGE_EXTERNAL_STORAGE` - Access all files (Android 11+)

Users must grant storage permission to use the external folder feature.

## Troubleshooting

### Android: "Permission denied" when selecting folder
- Go to Settings > Apps > Goal Tracker > Permissions
- Enable "Files and media" permission
- On Android 11+, you may need to enable "All files access"

### iOS: Can't select external folder
- iOS doesn't support external file access due to sandboxing
- Use "In-App Storage" mode instead

### Web: "showDirectoryPicker is not supported"
- Use Chrome, Edge, or Samsung Internet
- Firefox and Safari don't support the File System Access API

### Build errors after updating dependencies
```bash
# Clean and rebuild
rm -rf node_modules dist android/app/build ios/App/Pods
npm install
npm run build
npx cap sync
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Cross-platform with [Capacitor](https://capacitorjs.com/)
- Icons from [Lucide](https://lucide.dev/)
- State management with [Zustand](https://zustand-demo.pmnd.rs/)
