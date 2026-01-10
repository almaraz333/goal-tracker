# Mobile PWA Setup Guide

This guide explains how to install Goal Tracker as a Progressive Web App (PWA) on your Android phone, allowing you to track your goals with direct file access to your synced Goals folder.

## Prerequisites

1. **Chrome for Android** version 132+ (or Samsung Internet 29+)
2. **Syncthing** (or similar) set up to sync your Goals folder between PC and phone
3. Your Goals folder synced to your phone's storage

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

3. **Important**: The site MUST be served over HTTPS for the File System Access API to work (except for localhost).

## Installing the PWA

1. Open the Goal Tracker site in Chrome on your phone

2. You should see a banner or can tap the three-dot menu → "Add to Home screen" or "Install app"

3. Confirm the installation

4. The app will now appear as an icon on your home screen

## First-Time Setup

When you first open the PWA:

1. You'll see a welcome screen explaining that the app needs access to your Goals folder

2. Tap "Select Goals Folder"

3. Navigate to and select your synced Goals folder (e.g., `/storage/emulated/0/Syncthing/Goals`)

4. Grant permission when prompted

5. Your goals will load automatically!

## How It Works

### File System Access API
The PWA uses the File System Access API (`showDirectoryPicker()`) to:
- Read goal markdown files directly from your file system
- Write changes back to the files when you check off tasks

### Permission Handling
- The folder handle is stored in IndexedDB, so you don't need to re-select the folder each time
- However, you may need to **grant permission again** when reopening the app
- If permission is needed, you'll see a simple "Grant Access" button

### Syncing
- Changes made on your phone are written directly to the markdown files
- Syncthing (or your sync service) will automatically sync changes to your PC
- Changes made on PC will sync to your phone and show up next time you open the app

## Troubleshooting

### "File System Access API not supported"
- Make sure you're using Chrome 132+ or Samsung Internet 29+
- The WebView in some apps may not support this API
- Try updating your browser

### "Permission denied" repeatedly
- Some Android versions have stricter file access policies
- Try selecting a folder in your internal storage rather than SD card
- Make sure the folder has read/write permissions for your user

### Changes not syncing
- Check that Syncthing is running on both devices
- Verify the folder is correctly configured in Syncthing
- Check for sync conflicts (files ending in `.sync-conflict-*`)

### Goals not loading after folder selection
- Make sure the selected folder contains markdown files with the expected format
- Check that files have `.md` extension
- Verify the frontmatter format matches what the app expects

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

**Note**: In dev mode, the app uses the Vite plugin for file access (configured via `VITE_GOALS_PATH`), not the File System Access API. To test the PWA folder picker, you need to:
- Build with `npm run build`
- Serve with `npm run preview`
- Or test in production

## Browser Support

| Browser | Min Version | Notes |
|---------|-------------|-------|
| Chrome Android | 132+ | Full support |
| Samsung Internet | 29+ | Full support |
| Chrome Desktop | 86+ | Full support |
| Edge Desktop | 86+ | Full support |
| Firefox | ❌ | Not supported |
| Safari | ❌ | Not supported |

## Security Notes

- The File System Access API requires a secure context (HTTPS or localhost)
- Permission grants are scoped to the specific folder you selected
- The app can only access files within the selected folder
- Permissions can be revoked in Chrome settings → Site Settings
