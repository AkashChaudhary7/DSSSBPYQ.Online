import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const wrapperPropertiesContent = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.13-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`;

const nestedProjectDirs = [
  'node_modules/@capacitor/android/capacitor',
  'node_modules/@capacitor/app/android',
  'node_modules/@capacitor/keyboard/android',
  'node_modules/@capacitor/status-bar/android',
  'node_modules/@capacitor/haptics/android',
  'node_modules/@capacitor-community/admob/android'
];

console.log('[patch-gradle-wrappers] Ensuring all nested Capacitor plugin Gradle wrappers use Gradle 8.13...');

let patchedCount = 0;
for (const relDir of nestedProjectDirs) {
  const projectDir = path.join(rootDir, relDir);
  if (fs.existsSync(projectDir)) {
    const wrapperDir = path.join(projectDir, 'gradle', 'wrapper');
    fs.mkdirSync(wrapperDir, { recursive: true });
    const wrapperPropertiesPath = path.join(wrapperDir, 'gradle-wrapper.properties');
    fs.writeFileSync(wrapperPropertiesPath, wrapperPropertiesContent, 'utf8');
    console.log(`  ✓ Patched: ${relDir}/gradle/wrapper/gradle-wrapper.properties -> Gradle 8.13`);
    patchedCount++;
  } else {
    console.log(`  - Skipped (directory not found): ${relDir}`);
  }
}

console.log(`[patch-gradle-wrappers] Successfully patched ${patchedCount} nested Gradle wrappers.`);
