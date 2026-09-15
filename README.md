# Glim - Shake to Flashlight 🔦

**Glim** is a privacy-first, Material 3 styled Android utility that lets you toggle your flashlight with a simple shake gesture. No ads, no tracking, just light when you need it.

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

To get started with **Glim**:

1. **Download the APK:** Go to the [Releases](https://github.com/emonmirth/android-flashlight-app/releases) section of this repository.
2. **Install:** Download the latest `Glim-debug.apk` and install it on your Android device (ensure "Install from unknown sources" is enabled).
3. **Permissions:** Grant **Camera** and **Notification** permissions when prompted.
4. **Enjoy:** Shake your phone to test the light!

> [!TIP]
> Add the **Glim Tile** to your Quick Settings for even faster control!

---

## 🛠️ For Developers

This project is built using a React-based exporter that generates a native Android (Kotlin + Jetpack Compose) project.

### Local Setup
1. **Clone the repo:** `git clone https://github.com/emonmirth/android-flashlight-app.git`
2. **Install Node.js dependencies:** `npm install`
3. **Run Dev Server:** `npm run dev` (to preview the web interface)
4. **Export Android Project:** `npm run export:android` (generates native code in `./android-project`)

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
- **Open an Issue:** [Click here to submit feedback](https://github.com/emonmirth/android-flashlight-app/issues)
- **Give a Star:** If you like the app, consider giving this repo a ⭐!

---

## 🛡️ Privacy
**Glim** does not collect any data. The camera permission is used solely for the flashlight hardware, and the sensor data never leaves your device.

---

*Developed with ❤️ by [EonMirth](https://github.com/emonmirth)*
