import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const iconSource = path.join(projectRoot, 'public', 'favicon.png');
const webTargets = [
  { size: 180, outputPath: path.join(projectRoot, 'public', 'apple-touch-icon.png') },
  { size: 192, outputPath: path.join(projectRoot, 'public', 'pwa-192x192.png') },
  { size: 512, outputPath: path.join(projectRoot, 'public', 'pwa-512x512.png') },
];
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

  await sharp(iconSource)
    .resize(size, size, {
      fit: 'cover',
      kernel: sharp.kernel.lanczos3,
    })
    .flatten({ background: backgroundColor })
    .png()
    .toFile(outputPath);
}

async function syncWebIcons() {
  await Promise.all(webTargets.map(({ size, outputPath }) => renderIcon(size, outputPath)));
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
  await Promise.all([syncWebIcons(), syncAndroidIcons(), syncIosIcon()]);
  console.log('Web and native app icons synced from public/favicon.png');
}

main().catch((error) => {
  console.error('Failed to sync native app icons:', error);
  process.exitCode = 1;
});