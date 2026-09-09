import JSZip from 'jszip';
import { ANDROID_FILES, ANDROID_SUPPORT_FILES } from '../nativeAndroidCode';

export async function generateAndroidStudioZip(): Promise<Blob> {
  const zip = new JSZip();

  // Add all primary code and manifest files
  for (const file of [...ANDROID_FILES, ...ANDROID_SUPPORT_FILES]) {
    zip.file(
      file.path.replaceAll('com/flashlight/shake', 'com/eonmirth/flashlight'),
      file.code.replaceAll('com.flashlight.shake', 'com.eonmirth.flashlight')
    );
  }

  // Add additional standard Android project files
  zip.file(
    'build.gradle.kts',
    `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
}
`
  );

  zip.file(
    'gradle.properties',
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
kotlin.code.style=official
android.nonTransitiveRClass=true
`
  );

  zip.file(
    'README.md',
    `# EonMirth Flashlight - Native Android App

An EonMirth privacy-first Android application that turns the device flashlight ON/OFF when shaken.

## Features
- **Real-time Accelerometer Sensor**: Vector magnitude shake detection with cooldown debouncing.
- **CameraManager API**: Hardware torch toggle with state callbacks.
- **Continuous Foreground Service**: Persistent notification with quick-action toggles that keeps sensor listening active in background & screen-off.
- **Proximity Sensor Guard**: Suppresses shake gestures when the phone is inside a pocket or handbag.
- **Jetpack Compose UI**: Material 3 UI with sensitivity slider, switch, and torch status indicator.

## How to Run in Android Studio
1. Unzip this directory.
2. In Android Studio, select **Open** and choose the unzipped folder.
3. Allow Gradle to sync dependencies.
4. Run on a physical Android device (cameras and flash require physical hardware).
`
  );

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
