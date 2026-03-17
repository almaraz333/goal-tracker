# Mobile Setup Guide

This app ships in two forms, both storing goal data locally on the device:

- Native wrapper via Capacitor for Android and iOS.
- Progressive Web App for browser installation.

## Native App Status

The repository includes generated Capacitor projects for Android and iOS.

Supported native storage behavior today:

- Android native: local app database supported.
- iOS native: local app database supported.
- No extra storage permissions or sync setup are required.

Native wrapper commands:

```bash
cd goal_tracker/app
npm install
npm run cap:sync
npm run cap:open:android
npm run cap:open:ios
```

Notes:

- Android builds can be opened and signed from Android Studio.
- iOS project files are generated and synced here, but final build and signing require a Mac with Xcode.

## PWA Setup

This guide also covers installing Goal Tracker as a Progressive Web App (PWA).

## Prerequisites

1. A modern browser with PWA install support
2. Node.js and npm for local builds

## Deployment Options

### Option A: Self-Hosted (Recommended for development)

1. Build the production version:
   ```bash
   cd goal_tracker/app
   npm run build
   ```

2. Serve the built files. You can use any static file server:
   ```bash
   npm run preview
   ```
   
   Or serve with Python:
   ```bash
   cd dist
   python -m http.server 8080
   ```

3. Find your computer's local IP address:
   ```bash
   # Linux
   ip addr show | grep "inet "
   
   # macOS
   ipconfig getifaddr en0
   ```

4. On your phone, open Chrome and navigate to:
   ```
   http://YOUR_COMPUTER_IP:4173   # for npm run preview
   # or
   http://YOUR_COMPUTER_IP:8080   # for Python server
   ```

### Option B: Hosted on a Server

1. Build the production version:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to any static hosting:
   - Vercel
   - Netlify
   - GitHub Pages
   - Your own web server

3. For production PWA installs, serve the site over HTTPS.

## Installing the PWA

1. Open the Goal Tracker site in Chrome on your phone

2. You should see a banner or can tap the three-dot menu → "Add to Home screen" or "Install app"

3. Confirm the installation

4. The app will now appear as an icon on your home screen

## First-Time Setup

When you first open the app, it initializes its local database automatically. New goals are created and updated directly inside the app.

## How It Works

- Goals are stored locally using IndexedDB.
- The same storage flow is used by the web app and the Capacitor wrapper.
- No extra storage permissions or sync setup are required.

## Troubleshooting

### App data looks missing
- Make sure you are opening the same app build and environment.
- App data is local to the installed app or browser profile.

### Native changes are not visible
- Run `npm run build` and `npm run cap:sync` before reopening the native project.

### iOS build issues
- Final iOS compilation and signing require Xcode on macOS.

## Development Testing

To test on your phone during development:

1. Start the dev server with network access:
   ```bash
   npm run dev
   ```
   
   The server will show URLs like:
   ```
   Local:   http://localhost:5173/
   Network: http://192.168.1.100:5173/
   ```

2. Connect your phone to the same WiFi network

3. Open the Network URL in Chrome on your phone

## Browser Support

| Browser | Min Version | Notes |
|---------|-------------|-------|
| Chrome Android | Current | PWA install support |
| Samsung Internet | Current | PWA install support |
| Chrome Desktop | Current | Full support |
| Edge Desktop | Current | Full support |
| Firefox | Current | Web app support, install behavior varies |
| Safari | Current | Web app support, install behavior varies |

## Security Notes

- Production PWAs should be served over HTTPS.
- App data is stored locally inside the browser or native app container.
