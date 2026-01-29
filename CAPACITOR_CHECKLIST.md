# Capacitor Conversion Checklist

This document tracks all features and their status across platforms after the Capacitor conversion.

## ✅ Completed Tasks

### Core Setup
- [x] Install Capacitor core packages (@capacitor/core, @capacitor/cli)
- [x] Install Capacitor platform packages (@capacitor/android, @capacitor/ios)
- [x] Install required plugins (@capacitor/filesystem, @capacitor/preferences, @capacitor/app, @capacitor/status-bar, @capacitor/splash-screen)
- [x] Install file picker plugin (@capawesome/capacitor-file-picker)
- [x] Create capacitor.config.ts with proper configuration
- [x] Add Android platform (npx cap add android)
- [x] Add iOS platform (npx cap add ios)
- [x] Configure Android permissions in AndroidManifest.xml

### Services
- [x] Create platform.service.ts for platform detection
- [x] Create capacitorFileSystem.service.ts for native file operations
- [x] Update storage.service.ts with 'capacitor-fs' storage mode
- [x] Add proper TypeScript types for new storage mode
- [x] Export new services from index.ts

### Components
- [x] Update VaultSetupScreen for native platform support
- [x] Add iOS limitation notice for external folder access
- [x] Add Android-specific folder selection tips

### App Lifecycle
- [x] Add app state change listener (flush writes on background)
- [x] Add back button handler for Android
- [x] Configure splash screen hiding
- [x] Configure status bar styling

### Build System
- [x] Update package.json with Capacitor scripts
- [x] Verify build works without errors
- [x] Sync web assets with native platforms

---

## Feature Verification Matrix

### Storage Features

| Feature | Web PWA | Android Native | iOS Native | Notes |
|---------|---------|----------------|------------|-------|
| External folder selection | ✅ | ✅ | ❌ | iOS sandboxed |
| In-app storage (IndexedDB) | ✅ | ✅ | ✅ | Works everywhere |
| Read goal files | ✅ | ✅ | ✅ | |
| Write goal files | ✅ | ✅ | ✅ | |
| File caching | ✅ | ✅ | ✅ | |
| Debounced saves | ✅ | ✅ | ✅ | |
| Flush on app background | N/A | ✅ | ✅ | |

### UI Features

| Feature | Web PWA | Android Native | iOS Native | Notes |
|---------|---------|----------------|------------|-------|
| Calendar month view | ✅ | 🔄 | 🔄 | Test on devices |
| Day detail view | ✅ | 🔄 | 🔄 | Test on devices |
| Goal creation | ✅ | 🔄 | 🔄 | Test on devices |
| Goal editing | ✅ | 🔄 | 🔄 | Test on devices |
| Task completion | ✅ | 🔄 | 🔄 | Test on devices |
| Theme switching | ✅ | 🔄 | 🔄 | Test on devices |
| Settings modal | ✅ | 🔄 | 🔄 | Test on devices |

### Platform Features

| Feature | Web PWA | Android Native | iOS Native | Notes |
|---------|---------|----------------|------------|-------|
| Status bar styling | N/A | ✅ | ✅ | Dark theme |
| Splash screen | N/A | ✅ | ✅ | Configured |
| Back button handling | N/A | ✅ | N/A | Android only |
| Deep linking | N/A | 🔄 | 🔄 | Future feature |
| Push notifications | N/A | 🔄 | 🔄 | Future feature |

**Legend:**
- ✅ Implemented & Tested
- 🔄 Implemented, needs device testing
- ❌ Not supported on platform
- N/A Not applicable

---

## Testing Checklist

### Pre-Release Testing

#### Android
- [ ] Install on physical device
- [ ] Grant storage permissions
- [ ] Select external Goals folder
- [ ] Create a new goal (in-app mode)
- [ ] Edit an existing goal
- [ ] Complete tasks and verify persistence
- [ ] Switch between storage modes
- [ ] Test app background/foreground cycle
- [ ] Test back button navigation
- [ ] Verify theme persistence
- [ ] Test on Android 10, 11, 12, 13, 14

#### iOS
- [ ] Install on physical device
- [ ] Verify iOS limitation notice shows
- [ ] Test in-app storage mode
- [ ] Create and edit goals
- [ ] Complete tasks and verify persistence
- [ ] Test app background/foreground cycle
- [ ] Verify theme persistence
- [ ] Test on iOS 15, 16, 17

#### Web PWA
- [ ] Build production version
- [ ] Deploy to HTTPS server
- [ ] Install as PWA on Android Chrome
- [ ] Test File System Access API
- [ ] Test IndexedDB storage
- [ ] Verify service worker caching

---

## Known Issues & Limitations

### iOS
1. **External folder access not available** - iOS sandboxes apps, preventing access to external folders like Syncthing. Users must use in-app storage.

### Android
1. **File picker selects files, not folders** - Due to SAF limitations, users need to select a file inside their Goals folder rather than the folder itself.
2. **Storage permissions on Android 11+** - May require "All files access" permission for some use cases.

### Web
1. **Limited browser support** - File System Access API only works in Chromium browsers (Chrome, Edge, Samsung Internet).

---

## Deployment Checklist

### Android Play Store
- [ ] Update app ID in capacitor.config.ts (com.yourcompany.goaltracker)
- [ ] Create signing keystore
- [ ] Configure signing in build.gradle
- [ ] Create store listing assets (icons, screenshots)
- [ ] Write privacy policy
- [ ] Build release AAB
- [ ] Create Play Store listing
- [ ] Submit for review

### iOS App Store
- [ ] Update bundle ID in Xcode
- [ ] Configure Apple Developer account
- [ ] Create App Store Connect listing
- [ ] Create store listing assets
- [ ] Write privacy policy
- [ ] Archive and upload build
- [ ] Submit for review

---

## Future Enhancements

### Planned
- [ ] Cloud sync option (Google Drive, iCloud, Dropbox)
- [ ] Push notifications for goal reminders
- [ ] Widget support (Android, iOS)
- [ ] Watch app (watchOS, Wear OS)
- [ ] Export/import functionality
- [ ] Biometric lock

### Under Consideration
- [ ] Collaborative goals (shared with family/team)
- [ ] Goal templates
- [ ] Statistics and insights
- [ ] Integration with calendar apps

---

## Commands Reference

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Capacitor
npm run cap:sync         # Sync web assets to native platforms
npm run cap:copy         # Copy web assets only (no plugin update)
npm run cap:open:android # Open Android Studio
npm run cap:open:ios     # Open Xcode
npm run cap:run:android  # Run on Android device/emulator
npm run cap:run:ios      # Run on iOS device/simulator

# Combined builds
npm run build:android    # Build web + sync Android
npm run build:ios        # Build web + sync iOS
npm run build:native     # Build web + sync all platforms
```

---

## Troubleshooting

### Build fails after updating Capacitor plugins
```bash
npx cap sync
```

### Android build fails with Gradle errors
```bash
cd android
./gradlew clean
cd ..
npm run build:android
```

### iOS build fails with CocoaPods errors
```bash
cd ios/App
pod install --repo-update
cd ../..
npm run build:ios
```

### Web assets not updating on device
```bash
npm run build
npx cap copy
# Then rebuild in Android Studio / Xcode
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Initial Capacitor conversion |

