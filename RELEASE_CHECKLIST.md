# Release Checklist

This file is the deployment path for the Goal Tracker native apps and optional PWA release.

## 1. Prepare Release Metadata

Choose the values below before every store submission:

- `appId`: reverse-DNS identifier you control, for example `com.yourcompany.goaltracker`
- `appName`: display name shown on devices and in native project metadata
- `version`: marketing version, for example `1.0.0`
- `buildNumber`: positive integer that increases every release, for example `1`

Update Android, iOS, Capacitor, and `package.json` in one command:

```bash
npm run release:prepare -- --app-id com.yourcompany.goaltracker --app-name "Goal Tracker" --version 1.0.0 --build-number 1
```

Preview the command without writing files:

```bash
npm run release:prepare -- --app-id com.yourcompany.goaltracker --app-name "Goal Tracker" --version 1.0.0 --build-number 1 --dry-run
```

Files updated by the command:

- `package.json`
- `capacitor.config.ts`
- `android/app/build.gradle`
- `android/app/src/main/res/values/strings.xml`
- `ios/App/App/Info.plist`
- `ios/App/App.xcodeproj/project.pbxproj`

## 2. Validate Before Native Builds

From the `app/` directory run:

```bash
npm install
npm run lint
npm run cap:sync
```

What `npm run cap:sync` now does:

- regenerates Android and iOS app icons from `public/pwa-512x512.png`
- builds the Vite web app
- syncs the built web assets into the Android and iOS Capacitor projects

## 3. Android Release

Open Android Studio:

```bash
npm run cap:open:android
```

Then complete this checklist:

1. Confirm `applicationId`, `versionCode`, and `versionName` in `android/app/build.gradle`.
2. Confirm launcher icons look correct in the app preview.
3. Set up or select the production signing key in Android Studio.
4. Build a signed Android App Bundle (`.aab`).
5. Upload the `.aab` to Google Play Console Internal Testing first.
6. Smoke-test install, launch, calendar behavior, theme switching, and goal creation on a real device.
7. Promote the tested build to Production when ready.

Google Play submission items to have ready:

1. App title and short description.
2. Full description.
3. App icon, feature graphic, and screenshots.
4. Privacy policy URL if required by your listing/data usage.
5. Data safety answers.
6. Content rating questionnaire.
7. Target audience and app category.

## 4. iOS Release

Final iOS signing and archive upload require a Mac with Xcode.

On the Mac run:

```bash
npm install
npm run cap:sync
npm run cap:open:ios
```

Then complete this checklist in Xcode:

1. Confirm Team and Signing are set correctly.
2. Confirm Bundle Identifier matches the release value.
3. Confirm Version and Build match the release value.
4. Build and run once on a device or simulator.
5. Archive the app with `Product > Archive`.
6. Upload the archive to App Store Connect.
7. Distribute through TestFlight first.
8. Promote the tested build to App Store release.

App Store Connect items to have ready:

1. App name, subtitle, and keywords.
2. Privacy policy URL and support URL.
3. Screenshots for required device sizes.
4. App description and promotional text.
5. App category.
6. Age rating questionnaire.
7. App privacy answers.
8. Export compliance answer if prompted.

## 5. Optional PWA Release

If you also want the web-installable version live:

```bash
npm run build
```

Deploy the `dist/` directory to HTTPS static hosting such as Netlify, Vercel, GitHub Pages, or your own server.

## 6. Final Smoke Test

Before publishing any platform, verify:

1. App launches without dev-server dependencies.
2. New goals can be created and categories persist.
3. Daily completion updates the calendar immediately.
4. Theme changes, including calendar colors, apply correctly.
5. Existing locally stored data still loads.
6. App icon and display name are correct.