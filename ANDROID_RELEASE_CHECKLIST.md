# EonMirth Flashlight — APK release checklist

## Before the first APK

- [x] Buildable Android source export, including Gradle config and required XML resources
- [x] EonMirth product attribution and privacy statement
- [x] GitHub Actions workflow to create a debug APK without Android Studio
- [ ] Test camera torch, shake detection, pocket protection and notification on a physical Android device
- [ ] Replace the temporary EonMirth vector launcher icon with brand-approved adaptive icon artwork
- [x] Android application ID set to `com.eonmirth.flashlight`

## Before a public release / Play Store

- [ ] Create and securely store a release signing keystore
- [ ] Build a signed AAB (not a debug APK)
- [ ] Prepare privacy policy, screenshots, feature graphic and store listing
- [ ] Check current Google Play policy for foreground-service use and complete its declaration if required
- [ ] Test on Android 8 through the newest Android version, including a phone without a proximity sensor

## GitHub build

1. Create a GitHub repository and push this project to its `main` branch.
2. Open **Actions → Build Android APK → Run workflow**.
3. When it completes, download **EonMirth-Flashlight-debug-apk** from the workflow artifacts.
4. Transfer `app-debug.apk` to an Android phone and allow installation from the app used to open it.

The debug APK is for private testing only; it cannot be used as the final Play Store release.
