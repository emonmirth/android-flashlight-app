import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { ANDROID_FILES, ANDROID_SUPPORT_FILES } from '../src/nativeAndroidCode';

const outputDir = join(process.cwd(), 'android-project');

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

for (const file of [...ANDROID_FILES, ...ANDROID_SUPPORT_FILES]) {
  const target = join(outputDir, file.path.replaceAll('com/flashlight/shake', 'com/eonmirth/flashlight'));
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(
    target,
    file.code.replaceAll('com.flashlight.shake', 'com.eonmirth.flashlight').trimStart() + '\n',
    'utf8'
  );
}

writeFileSync(join(outputDir, 'build.gradle.kts'), `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`, 'utf8');

writeFileSync(join(outputDir, 'gradle.properties'), `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true
`, 'utf8');

writeFileSync(join(outputDir, 'README.md'), `# EonMirth Flashlight\n\nGenerated Android project. Run \`gradle :app:assembleDebug\` to build a test APK.\n`, 'utf8');
console.log(`Android project generated in ${outputDir}`);
