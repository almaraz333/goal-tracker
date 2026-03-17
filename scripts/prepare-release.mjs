import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const files = {
  packageJson: path.join(projectRoot, 'package.json'),
  capacitorConfig: path.join(projectRoot, 'capacitor.config.ts'),
  androidBuildGradle: path.join(projectRoot, 'android', 'app', 'build.gradle'),
  androidStrings: path.join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'values', 'strings.xml'),
  iosInfoPlist: path.join(projectRoot, 'ios', 'App', 'App', 'Info.plist'),
  iosProject: path.join(projectRoot, 'ios', 'App', 'App.xcodeproj', 'project.pbxproj'),
};

const usage = `Usage:\n  npm run release:prepare -- --app-id com.example.goaltracker --version 1.0.0 --build-number 1 [--app-name \"Goal Tracker\"] [--dry-run]\n\nOptions:\n  --app-id         Reverse-DNS bundle identifier used by Android and iOS\n  --version        Marketing version, for example 1.0.0\n  --build-number   Positive integer release/build number used by Android and iOS\n  --app-name       Visible app name. Defaults to \"Goal Tracker\"\n  --dry-run        Print the changes without writing files\n  --help           Show this message\n`;

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (!arg.startsWith('--')) {
      continue;
    }

    const key = arg.slice(2);
    if (key === 'dry-run' || key === 'help') {
      parsed[key] = true;
      continue;
    }

    const value = argv[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }

    parsed[key] = value;
    index += 1;
  }

  return parsed;
}

function ensureValidAppId(appId) {
  const appIdPattern = /^[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)+$/;
  if (!appIdPattern.test(appId)) {
    throw new Error('Invalid app id. Use a reverse-DNS identifier such as com.example.goaltracker');
  }
}

function normalizeAppId(appId) {
  return appId.toLowerCase();
}

function ensureValidVersion(version) {
  const versionPattern = /^\d+(\.\d+){1,2}$/;
  if (!versionPattern.test(version)) {
    throw new Error('Invalid version. Use a numeric version such as 1.0 or 1.0.0');
  }
}

function ensureValidBuildNumber(buildNumber) {
  if (!/^\d+$/.test(buildNumber) || Number(buildNumber) <= 0) {
    throw new Error('Invalid build number. Use a positive integer such as 1');
  }
}

function replaceOrThrow(content, pattern, replacement, description) {
  if (!pattern.test(content)) {
    throw new Error(`Could not update ${description}`);
  }

  return content.replace(pattern, replacement);
}

async function findFileByName(rootDir, fileName) {
  const entries = await readdir(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      const match = await findFileByName(entryPath, fileName);
      if (match) {
        return match;
      }
      continue;
    }

    if (entry.isFile() && entry.name === fileName) {
      return entryPath;
    }
  }

  return null;
}

async function updatePackageJson(version, dryRun) {
  const raw = await readFile(files.packageJson, 'utf8');
  const packageJson = JSON.parse(raw);
  packageJson.version = version;

  if (!dryRun) {
    await writeFile(files.packageJson, `${JSON.stringify(packageJson, null, 2)}\n`);
  }
}

async function updateCapacitorConfig(appId, appName, dryRun) {
  let content = await readFile(files.capacitorConfig, 'utf8');
  content = replaceOrThrow(content, /appId:\s*'[^']*'/, `appId: '${appId}'`, 'Capacitor appId');
  content = replaceOrThrow(content, /appName:\s*'[^']*'/, `appName: '${appName}'`, 'Capacitor appName');

  if (!dryRun) {
    await writeFile(files.capacitorConfig, content);
  }
}

async function updateAndroidFiles(appId, appName, version, buildNumber, dryRun) {
  let buildGradle = await readFile(files.androidBuildGradle, 'utf8');
  buildGradle = replaceOrThrow(buildGradle, /namespace\s*=\s*"[^"]*"/, `namespace = "${appId}"`, 'Android namespace');
  buildGradle = replaceOrThrow(buildGradle, /applicationId\s+"[^"]*"/, `applicationId "${appId}"`, 'Android applicationId');
  buildGradle = replaceOrThrow(buildGradle, /versionCode\s+\d+/, `versionCode ${buildNumber}`, 'Android versionCode');
  buildGradle = replaceOrThrow(buildGradle, /versionName\s+"[^"]*"/, `versionName "${version}"`, 'Android versionName');

  let stringsXml = await readFile(files.androidStrings, 'utf8');
  stringsXml = replaceOrThrow(stringsXml, /<string name="app_name">[^<]*<\/string>/, `<string name="app_name">${appName}</string>`, 'Android app_name');
  stringsXml = replaceOrThrow(stringsXml, /<string name="title_activity_main">[^<]*<\/string>/, `<string name="title_activity_main">${appName}</string>`, 'Android title_activity_main');
  stringsXml = replaceOrThrow(stringsXml, /<string name="package_name">[^<]*<\/string>/, `<string name="package_name">${appId}</string>`, 'Android package_name');
  stringsXml = replaceOrThrow(stringsXml, /<string name="custom_url_scheme">[^<]*<\/string>/, `<string name="custom_url_scheme">${appId}</string>`, 'Android custom_url_scheme');

  const javaRoot = path.join(projectRoot, 'android', 'app', 'src', 'main', 'java');
  const currentMainActivityPath = await findFileByName(javaRoot, 'MainActivity.java');
  if (!currentMainActivityPath) {
    throw new Error('Could not locate Android MainActivity.java');
  }

  let mainActivity = await readFile(currentMainActivityPath, 'utf8');
  mainActivity = replaceOrThrow(mainActivity, /^package\s+[^;]+;/m, `package ${appId};`, 'Android MainActivity package');

  const newMainActivityDirectory = path.join(javaRoot, ...appId.split('.'));
  const newMainActivityPath = path.join(newMainActivityDirectory, 'MainActivity.java');

  if (!dryRun) {
    await Promise.all([
      writeFile(files.androidBuildGradle, buildGradle),
      writeFile(files.androidStrings, stringsXml),
    ]);

    await mkdir(newMainActivityDirectory, { recursive: true });
    await writeFile(newMainActivityPath, mainActivity);

    if (currentMainActivityPath !== newMainActivityPath) {
      await rm(currentMainActivityPath);
    }
  }
}

async function updateIosFiles(appId, appName, version, buildNumber, dryRun) {
  let infoPlist = await readFile(files.iosInfoPlist, 'utf8');
  infoPlist = replaceOrThrow(
    infoPlist,
    /(<key>CFBundleDisplayName<\/key>\s*<string>)[^<]*(<\/string>)/,
    `$1${appName}$2`,
    'iOS CFBundleDisplayName'
  );

  let project = await readFile(files.iosProject, 'utf8');
  project = replaceOrThrow(project, /CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${buildNumber};`, 'iOS build number');
  project = replaceOrThrow(project, /MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${version};`, 'iOS marketing version');
  project = replaceOrThrow(project, /PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g, `PRODUCT_BUNDLE_IDENTIFIER = ${appId};`, 'iOS bundle identifier');

  if (!dryRun) {
    await Promise.all([
      writeFile(files.iosInfoPlist, infoPlist),
      writeFile(files.iosProject, project),
    ]);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(usage);
    return;
  }

  const requestedAppId = args['app-id'];
  const version = args.version;
  const buildNumber = args['build-number'];
  const appName = args['app-name'] ?? 'Goal Tracker';
  const dryRun = Boolean(args['dry-run']);

  if (!requestedAppId || !version || !buildNumber) {
    throw new Error(`Missing required arguments.\n\n${usage}`);
  }

  const appId = normalizeAppId(requestedAppId);

  ensureValidAppId(appId);
  ensureValidVersion(version);
  ensureValidBuildNumber(buildNumber);

  if (requestedAppId !== appId) {
    console.log(`Normalized appId to lowercase: ${appId}`);
  }

  await updatePackageJson(version, dryRun);
  await updateCapacitorConfig(appId, appName, dryRun);
  await updateAndroidFiles(appId, appName, version, buildNumber, dryRun);
  await updateIosFiles(appId, appName, version, buildNumber, dryRun);

  const action = dryRun ? 'Validated release metadata targets for' : 'Updated release metadata for';
  console.log(`${action} ${appName}`);
  console.log(`  appId: ${appId}`);
  console.log(`  version: ${version}`);
  console.log(`  buildNumber: ${buildNumber}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});