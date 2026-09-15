# Glim - Shake to Flashlight 🔦

**Glim** is a privacy-first, Material 3 styled Android utility that lets you toggle your flashlight with a simple shake gesture. No ads, no tracking, just light when you need it.

---

## ⚡ Quick Download

### [📥 **Download Latest APK** 📥](https://github.com/emonmirth/android-flashlight-app/releases/latest)

> **Latest Version:** Check [Releases](https://github.com/emonmirth/android-flashlight-app/releases) for the newest `Glim-debug.apk`

---

## ✨ Features

- **Shake to Toggle:** Quickly turn your flashlight on or off with a shake gesture.
- **Quick Settings Tile:** Toggle the shake listener directly from your notification shade.
- **Smart Auto-Off:** Automatically turns off the torch after a set duration (1, 3, 5, or 10 minutes) to save battery.
- **Pocket Protection:** Uses the proximity sensor to prevent accidental activation while in your pocket or bag.
- **Material 3 Design:** A clean, modern interface that follows the latest Android design guidelines.
- **Background Support:** Stays active even when the screen is off or the app is closed.

---

## 🚀 Installation & Download

### Step 1: Download APK
Go to **[Releases](https://github.com/emonmirth/android-flashlight-app/releases)** and download the latest `Glim-debug.apk`

### Step 2: Enable Installation from Unknown Sources
1. Open **Settings** on your Android device
2. Go to **Security** or **Apps & notifications**
3. Enable **"Install from unknown sources"** (exact name may vary by device)

### Step 3: Install the APK
1. Open your file manager
2. Navigate to where you downloaded `Glim-debug.apk`
3. Tap on it and follow the installation prompts

### Step 4: Grant Permissions
When you first open **Glim**, grant:
- ✅ **Camera** permission (for flashlight control)
- ✅ **Notification** permission (for background service)

### Step 5: Enjoy!
Shake your phone to toggle the flashlight! 🔦

> [!TIP]
> Add the **Glim Tile** to your Quick Settings for even faster control without shaking!

---

## 📱 System Requirements

- **Android Version:** Android 6.0 (API 23) or higher
- **Permissions Required:** Camera, Notification, Sensor access
- **Device:** Any Android phone with a flashlight/LED

---

## 🛠️ For Developers

This project is built using a React-based exporter that generates a native Android (Kotlin + Jetpack Compose) project.

### Local Setup
1. **Clone the repo:** `git clone https://github.com/emonmirth/android-flashlight-app.git`
2. **Install Node.js dependencies:** `npm install` or `bun install`
3. **Run Dev Server:** `npm run dev` (to preview the web interface)
4. **Export Android Project:** `npm run export:android` (generates native code in `./android-project`)
5. **Build APK:** Open `android-project` in Android Studio and build

### Project Structure
- **Web UI:** React + Vite + Tailwind CSS (simulator & controls)
- **Native Code:** Kotlin + Jetpack Compose + Material 3
- **Hardware:** CameraManager (torch), SensorManager (accelerometer), ProximitySensor

---

## ⚖️ License & Brand Policy

### Software License
This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for the full text.

### Trademark & Brand Policy
While the source code of **Glim** is open-source, the **Glim** name, logo, and the **EonMirth** brand are trademarks owned by **EonMirth**. 

- You **may** fork this repository for personal use or study.
- You **may** contribute to this official repository via Pull Requests.
- You **may NOT** redistribute this application on any store (Google Play, Amazon, etc.) using the "Glim" or "EonMirth" name, branding, or logos without explicit written permission.

---

## 💬 Feedback & Contribution

We love feedback! If you find a bug or have a feature suggestion:
- **[Open an Issue](https://github.com/emonmirth/android-flashlight-app/issues)** - Report bugs or suggest features
- **[View All Issues](https://github.com/emonmirth/android-flashlight-app/issues)** - See what's being worked on
- **Give a Star:** If you like the app, consider giving this repo a ⭐!

---

## 🛡️ Privacy

**Glim** does not collect any data. 
- The **Camera** permission is used solely for the flashlight hardware
- **Sensor data** (accelerometer, proximity) never leaves your device
- **No tracking**, no ads, no analytics
- Fully **open-source** for transparency

---

## 📄 License

This project is open-source. Check the LICENSE file for details.

---

*Developed with ❤️ by [EonMirth](https://github.com/emonmirth)*

**Last Updated:** 2026-09-13