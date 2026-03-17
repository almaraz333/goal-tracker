import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const pwaIconSource = path.join(projectRoot, 'public', 'pwa-512x512.png');
const iosAppIconPath = path.join(
  projectRoot,
  'ios',
  'App',
  'App',
  'Assets.xcassets',
  'AppIcon.appiconset',
  'AppIcon-512@2x.png'
);

const androidTargets = [
  { directory: 'mipmap-mdpi', launcherSize: 48, foregroundSize: 108 },
  { directory: 'mipmap-hdpi', launcherSize: 72, foregroundSize: 162 },
  { directory: 'mipmap-xhdpi', launcherSize: 96, foregroundSize: 216 },
  { directory: 'mipmap-xxhdpi', launcherSize: 144, foregroundSize: 324 },
  { directory: 'mipmap-xxxhdpi', launcherSize: 192, foregroundSize: 432 },
];

const backgroundColor = '#1f2937';

async function renderIcon(size, outputPath) {
  await mkdir(path.dirname(outputPath), { recursive: true });

  await sharp(pwaIconSource)
    .resize(size, size, {
      fit: 'contain',
      kernel: sharp.kernel.lanczos3,
    })
    .flatten({ background: backgroundColor })
    .png()
    .toFile(outputPath);
}

async function syncAndroidIcons() {
  await Promise.all(
    androidTargets.flatMap(({ directory, launcherSize, foregroundSize }) => {
      const baseDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', directory);

      return [
        renderIcon(launcherSize, path.join(baseDir, 'ic_launcher.png')),
        renderIcon(launcherSize, path.join(baseDir, 'ic_launcher_round.png')),
        renderIcon(foregroundSize, path.join(baseDir, 'ic_launcher_foreground.png')),
      ];
    })
  );
}

async function syncIosIcon() {
  await renderIcon(1024, iosAppIconPath);
}

async function main() {
  await Promise.all([syncAndroidIcons(), syncIosIcon()]);
  console.log('Native app icons synced from public/pwa-512x512.png');
}

main().catch((error) => {
  console.error('Failed to sync native app icons:', error);
  process.exitCode = 1;
});