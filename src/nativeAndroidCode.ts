import { AndroidFile } from './types';

export const ANDROID_FILES: AndroidFile[] = [
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    category: 'manifest',
    description: 'Declares camera, foreground service, wake lock, sensor features, and the background service.',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    >

    <!-- Permissions for Camera Flashlight & Foreground Service -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />

    <!-- Hardware Features -->
    <uses-feature
        android:name="android.hardware.camera"
        android:required="false" />
    <uses-feature
        android:name="android.hardware.camera.flash"
        android:required="true" />
    <uses-feature
        android:name="android.hardware.sensor.accelerometer"
        android:required="true" />
    <uses-feature
        android:name="android.hardware.sensor.proximity"
        android:required="false" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@drawable/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@drawable/ic_launcher"
        android:supportsRtl="true"
        android:theme="@style/Theme.Glim"
        tools:targetApi="35">

        <!-- Main Compose Activity -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:theme="@style/Theme.Glim">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Continuous Foreground Service for Shake Gestures -->
        <service
            android:name=".service.GlimService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="Flashlight control via shake gesture" />
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_DESCRIPTION"
                android:value="Monitors the device accelerometer in the background to detect shake gestures and toggle the flashlight, providing a hands-free utility experience." />
        </service>

        <receiver
            android:name=".receiver.BootCompletedReceiver"
            android:enabled="true"
            android:exported="false">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

        <!-- Quick Settings Tile for fast toggle -->
        <service
            android:name=".service.GlimTileService"
            android:icon="@drawable/ic_flashlight_notif"
            android:label="@string/app_name"
            android:permission="android.permission.BIND_QUICK_SETTINGS_TILE"
            android:exported="true">
            <intent-filter>
                <action android:name="android.service.quicksettings.action.QS_TILE" />
            </intent-filter>
            <meta-data
                android:name="android.service.quicksettings.ACTIVE_TILE"
                android:value="true" />
        </service>

    </application>
</manifest>`
  },
  {
    path: 'app/src/main/java/com/eonmirth/glim/core/feature/FeatureState.kt',
    name: 'FeatureState.kt',
    category: 'kotlin',
    description: 'Feature state and identification models distinguishing Enabled, Disabled, Unsupported, and PermissionRequired states.',
    code: `package com.eonmirth.glim.core.feature

enum class FeatureId(val displayName: String) {
    SHAKE_FLASHLIGHT("Shake Flashlight")
}

enum class FeatureStatus {
    ENABLED,
    DISABLED,
    UNSUPPORTED,
    PERMISSION_REQUIRED,
    LIMITED,
    ERROR
}

data class FeatureState(
    val id: FeatureId,
    val status: FeatureStatus,
    val message: String? = null
)`
  },
  {
    path: 'app/src/main/java/com/eonmirth/glim/core/hardware/HardwareCapabilities.kt',
    name: 'HardwareCapabilities.kt',
    category: 'kotlin',
    description: 'Hardware capability detectors inspecting camera flash, accelerometer, and proximity sensor availability.',
    code: `package com.eonmirth.glim.core.hardware

import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorManager

object HardwareCapabilities {

    fun hasCameraFlash(context: Context): Boolean {
        return context.packageManager.hasSystemFeature(PackageManager.FEATURE_CAMERA_FLASH)
    }

    fun hasAccelerometer(context: Context): Boolean {
        val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
        return sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER) != null
    }

    fun hasProximitySensor(context: Context): Boolean {
        val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
        return sensorManager?.getDefaultSensor(Sensor.TYPE_PROXIMITY) != null
    }
}`
  },
  {
    path: 'app/src/main/java/com/eonmirth/glim/core/permission/SmartPermissionManager.kt',
    name: 'SmartPermissionManager.kt',
    category: 'kotlin',
    description: 'Centralized permission manager distinguishing critical (Camera) and optional (Notification) permissions.',
    code: `package com.eonmirth.glim.core.permission

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.content.ContextCompat
import com.eonmirth.glim.core.feature.FeatureId

object SmartPermissionManager {

    fun hasCameraPermission(context: Context): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED
    }

    fun hasNotificationPermission(context: Context): Boolean {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
        } else {
            true
        }
    }

    /**
     * Critical permissions strictly required to execute the feature.
     * Shake -> Flashlight requires CAMERA to toggle the torch.
     */
    fun getCriticalPermissions(featureId: FeatureId): List<String> {
        return when (featureId) {
            FeatureId.SHAKE_FLASHLIGHT -> listOf(Manifest.permission.CAMERA)
        }
    }

    /**
     * Optional permissions that enhance the experience (e.g. visible foreground notification),
     * but whose absence does not block the feature from operating.
     */
    fun getOptionalPermissions(featureId: FeatureId): List<String> {
        return when (featureId) {
            FeatureId.SHAKE_FLASHLIGHT -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                    listOf(Manifest.permission.POST_NOTIFICATIONS)
                } else {
                    emptyList()
                }
            }
        }
    }

    fun getMissingCriticalPermissions(context: Context, featureId: FeatureId): List<String> {
        return getCriticalPermissions(featureId).filter { permission ->
            ContextCompat.checkSelfPermission(context, permission) != PackageManager.PERMISSION_GRANTED
        }
    }

    /**
     * Checks if all critical permissions required for the feature are granted.
     * Notification permission denial does NOT prevent this from returning true.
     */
    fun isFeaturePermissionGranted(context: Context, featureId: FeatureId): Boolean {
        return getMissingCriticalPermissions(context, featureId).isEmpty()
    }
}`
  },
  {
    path: 'app/src/main/java/com/eonmirth/glim/core/persistence/PreferencesManager.kt',
    name: 'PreferencesManager.kt',
    category: 'kotlin',
    description: 'Persistent state boundary preserving backward-compatible SharedPreferences keys for service toggle and sensitivity.',
    code: `package com.eonmirth.glim.core.persistence

import android.content.Context
import android.content.SharedPreferences

package com.eonmirth.glim.core.persistence

import android.content.Context
import android.content.SharedPreferences

class PreferencesManager(context: Context) {

    companion object {
        const val PREFS_NAME = "glim_prefs"
        const val KEY_SERVICE_ENABLED = "service_enabled"
        const val KEY_SENSITIVITY_G_FORCE = "sensitivity_g_force"
        const val KEY_POCKET_PROTECTION = "pocket_protection_enabled"
        const val KEY_AUTO_OFF_MINUTES = "auto_off_minutes"
        const val KEY_LAST_UPDATE_CHECK = "last_update_check"

        const val DEFAULT_SENSITIVITY = 2.4f
        const val DEFAULT_POCKET_PROTECTION = true
        const val DEFAULT_AUTO_OFF = 3 // 3 minutes
    }

    private val prefs: SharedPreferences =
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    var isGlimEnabled: Boolean
        get() = prefs.getBoolean(KEY_SERVICE_ENABLED, false)
        set(value) = prefs.edit().putBoolean(KEY_SERVICE_ENABLED, value).apply()

    var sensitivityGForce: Float
        get() = prefs.getFloat(KEY_SENSITIVITY_G_FORCE, DEFAULT_SENSITIVITY)
        set(value) = prefs.edit().putFloat(KEY_SENSITIVITY_G_FORCE, value).apply()

    var isPocketProtectionEnabled: Boolean
        get() = prefs.getBoolean(KEY_POCKET_PROTECTION, DEFAULT_POCKET_PROTECTION)
        set(value) = prefs.edit().putBoolean(KEY_POCKET_PROTECTION, value).apply()

    var autoOffMinutes: Int
        get() = prefs.getInt(KEY_AUTO_OFF_MINUTES, DEFAULT_AUTO_OFF)
        set(value) = prefs.edit().putInt(KEY_AUTO_OFF_MINUTES, value).apply()

    var lastUpdateCheck: Long
        get() = prefs.getLong(KEY_LAST_UPDATE_CHECK, 0L)
        set(value) = prefs.edit().putLong(KEY_LAST_UPDATE_CHECK, value).apply()
}
`
  },
  {
    path: 'app/src/main/java/com/eonmirth/glim/core/action/SmartAction.kt',
    name: 'SmartAction.kt',
    category: 'kotlin',
    description: 'Action engine foundation defining ActionResult and ToggleFlashlightAction with permission safety and SecurityException handling.',
    code: `package com.eonmirth.glim.core.action

import android.content.Context
import com.eonmirth.glim.camera.FlashlightController
import com.eonmirth.glim.core.hardware.HardwareCapabilities
import com.eonmirth.glim.core.permission.SmartPermissionManager

sealed class ActionResult {
    data class Success(val message: String, val timestamp: Long = System.currentTimeMillis()) : ActionResult()
    data class Failure(val reason: String, val timestamp: Long = System.currentTimeMillis()) : ActionResult()
    data class Unavailable(val reason: String, val timestamp: Long = System.currentTimeMillis()) : ActionResult()
}

interface SmartAction {
    val actionId: String
    fun execute(context: Context): ActionResult
}

class ToggleFlashlightAction(private val flashlightController: FlashlightController) : SmartAction {
    override val actionId: String = "ACTION_TOGGLE_FLASHLIGHT"

    override fun execute(context: Context): ActionResult {
        if (!HardwareCapabilities.hasCameraFlash(context)) {
            return ActionResult.Unavailable("Camera flash hardware unavailable on this device")
        }

        if (!SmartPermissionManager.hasCameraPermission(context)) {
            return ActionResult.Failure("Camera permission was revoked. Flashlight cannot operate.")
        }

        return try {
            val success = flashlightController.toggleTorch()
            if (success) {
                ActionResult.Success(
                    if (flashlightController.isTorchOn) "Flashlight turned ON" else "Flashlight turned OFF"
                )
            } else {
                ActionResult.Failure("Failed to toggle flashlight torch (Camera2 error or permission loss)")
            }
        } catch (e: SecurityException) {
            ActionResult.Failure("Camera permission missing: " + (e.message ?: "SecurityException"))
        } catch (e: Exception) {
            ActionResult.Failure("Unexpected error toggling torch: " + (e.message ?: "Unknown error"))
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/eonmirth/glim/core/sensor/SensorEngine.kt',
    name: 'SensorEngine.kt',
    category: 'kotlin',
    description: 'Centralized sensor management with explicit lifecycle, encapsulating accelerometer listening and proximity pocket checks.',
    code: `package com.eonmirth.glim.core.sensor

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.util.Log
import kotlin.math.sqrt

interface SensorEventListenerCallback {
    fun onShakeDetected(gForce: Float)
    fun onPocketStateChanged(isInsidePocket: Boolean)
}

class SensorEngine(
    private val context: Context,
    private val callback: SensorEventListenerCallback
) : SensorEventListener {

    companion object {
        private const val TAG = "SensorEngine"
    }

    private val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
    private val accelerometer: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
    private val proximitySensor: Sensor? = sensorManager.getDefaultSensor(Sensor.TYPE_PROXIMITY)

    var sensitivityThresholdGForce: Float = 2.4f
    var isPocketProtectionEnabled: Boolean = true

    private var isInsidePocket: Boolean = false
    private var isListening: Boolean = false

    fun startListening() {
        if (isListening) return

        accelerometer?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_GAME)
            Log.d(TAG, "Accelerometer registered with SENSOR_DELAY_GAME")
        }

        if (isPocketProtectionEnabled) {
            proximitySensor?.let {
                sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL)
                Log.d(TAG, "Proximity sensor registered")
            }
        }

        isListening = true
    }

    fun stopListening() {
        if (!isListening) return
        sensorManager.unregisterListener(this)
        isListening = false
        Log.d(TAG, "Sensor listeners unregistered")
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null) return

        when (event.sensor.type) {
            Sensor.TYPE_PROXIMITY -> {
                val distance = event.values[0]
                val maxRange = event.sensor.maximumRange
                // Defensive check for various proximity sensor types (binary vs continuous)
                val isNear = distance < maxRange && distance < 4.0f
                if (isNear != isInsidePocket) {
                    isInsidePocket = isNear
                    callback.onPocketStateChanged(isInsidePocket)
                    Log.d(TAG, "Proximity changed: distance=$distance, isInsidePocket=$isInsidePocket")
                }
            }

            Sensor.TYPE_ACCELEROMETER -> {
                if (isPocketProtectionEnabled && isInsidePocket) {
                    return
                }

                val x = event.values[0]
                val y = event.values[1]
                val z = event.values[2]

                val gX = x / SensorManager.GRAVITY_EARTH
                val gY = y / SensorManager.GRAVITY_EARTH
                val gZ = z / SensorManager.GRAVITY_EARTH

                val gForce = sqrt((gX * gX + gY * gY + gZ * gZ).toDouble()).toFloat()

                if (gForce >= sensitivityThresholdGForce) {
                    callback.onShakeDetected(gForce)
                }
            }
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}`
  },
  {
    path: 'app/src/main/java/com/eonmirth/glim/core/safety/SafetyEngine.kt',
    name: 'SafetyEngine.kt',
    category: 'kotlin',
    description: 'Safety abstraction ensuring debounce cooldown (600ms), pocket state suppression, and hardware validation.',
    code: `package com.eonmirth.glim.core.safety

import android.content.Context
import android.util.Log
import com.eonmirth.glim.core.hardware.HardwareCapabilities

class SafetyEngine(
    private val cooldownMs: Long = 600L
) {
    companion object {
        private const val TAG = "SafetyEngine"
    }

    private var lastTriggerTimestamp: Long = 0

    fun canExecuteShakeAction(
        context: Context,
        isInsidePocket: Boolean,
        pocketProtectionEnabled: Boolean
    ): Boolean {
        if (pocketProtectionEnabled && isInsidePocket) {
            Log.d(TAG, "Action suppressed: Device is inside pocket")
            return false
        }

        if (!HardwareCapabilities.hasCameraFlash(context)) {
            Log.w(TAG, "Action blocked: Device lacks camera flash")
            return false
        }

        val currentTime = System.currentTimeMillis()
        if (currentTime - lastTriggerTimestamp < cooldownMs) {
            Log.d(TAG, "Action blocked: In cooldown period")
            return false
        }

        lastTriggerTimestamp = currentTime
        return true
    }
}`
  },
  {
    path: 'app/src/main/java/com/eonmirth/glim/core/rule/SmartRule.kt',
    name: 'SmartRule.kt',
    category: 'kotlin',
    description: 'Rule engine foundation modeling Trigger -> SafetyCheck -> Action execution.',
    code: `package com.eonmirth.glim.core.rule

import android.content.Context
import com.eonmirth.glim.core.action.ActionResult
import com.eonmirth.glim.core.action.SmartAction
import com.eonmirth.glim.core.feature.FeatureId

data class SmartRule(
    val id: String,
    val featureId: FeatureId,
    val triggerName: String,
    val action: SmartAction
) {
    fun evaluateAndExecute(context: Context, isAllowedBySafety: Boolean): ActionResult {
        if (!isAllowedBySafety) {
            return ActionResult.Unavailable("Action blocked by safety check")
        }
        return action.execute(context)
    }
}`
  },
  {
    path: 'app/src/main/java/com/eonmirth/glim/core/log/ActivityLogManager.kt',
    name: 'ActivityLogManager.kt',
    category: 'kotlin',
    description: 'Lightweight in-memory activity and event logger capped at 50 events without storage or battery penalties.',
    code: `package com.eonmirth.glim.core.log

import com.eonmirth.glim.core.feature.FeatureId
import java.util.concurrent.CopyOnWriteArrayList

data class SmartLogEvent(
    val id: Long = System.currentTimeMillis(),
    val timestamp: Long = System.currentTimeMillis(),
    val featureId: FeatureId,
    val eventType: String,
    val description: String,
    val isSuccess: Boolean
)

object ActivityLogManager {
    private const val MAX_LOG_SIZE = 50
    private val logEvents = CopyOnWriteArrayList<SmartLogEvent>()

    fun log(featureId: FeatureId, eventType: String, description: String, isSuccess: Boolean = true) {
        val event = SmartLogEvent(
            featureId = featureId,
            eventType = eventType,
            description = description,
            isSuccess = isSuccess
        )
        logEvents.add(0, event)
        while (logEvents.size > MAX_LOG_SIZE) {
            logEvents.removeAt(logEvents.size - 1)
        }
    }

    fun getRecentEvents(): List<SmartLogEvent> = logEvents.toList()
}`
  },
  {
    path: 'app/src/main/java/com/eonmirth/glim/core/notification/SmartNotificationManager.kt',
    name: 'SmartNotificationManager.kt',
    category: 'kotlin',
    description: 'Encapsulates foreground service notification channels, PendingIntents, and error-safe notification updates.',
    code: `package com.eonmirth.glim.core.notification

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.eonmirth.glim.MainActivity
import com.eonmirth.glim.R
import com.eonmirth.glim.service.GlimService

class SmartNotificationManager(private val context: Context) {

    companion object {
        const val CHANNEL_ID = "shake_flashlight_foreground"
        const val NOTIFICATION_ID = 1001
    }

    fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Glim Background Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps shake-to-flashlight gesture active in the background"
                setShowBadge(false)
            }
            val manager = context.getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }
    }

    fun buildForegroundNotification(isTorchOn: Boolean, hasPermissionError: Boolean = false): Notification {
        val openAppIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val openAppPendingIntent = PendingIntent.getActivity(
            context, 0, openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val toggleIntent = Intent(context, GlimService::class.java).apply {
            action = GlimService.ACTION_TOGGLE_TORCH
        }
        val togglePendingIntent = PendingIntent.getService(
            context, 1, toggleIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(context, GlimService::class.java).apply {
            action = GlimService.ACTION_STOP
        }
        val stopPendingIntent = PendingIntent.getService(
            context, 2, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val statusText = when {
            hasPermissionError -> "Camera permission revoked • Tap to restore"
            isTorchOn -> "Flashlight is ON • Shake to turn off"
            else -> "Shake device to turn flashlight ON"
        }
        val toggleActionTitle = if (isTorchOn) "Turn Off" else "Turn On"

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle("Glim is Active")
            .setContentText(statusText)
            .setSmallIcon(R.drawable.ic_flashlight_notif)
            .setOngoing(true)
            .setContentIntent(openAppPendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)

        if (!hasPermissionError) {
            builder.addAction(R.drawable.ic_toggle, toggleActionTitle, togglePendingIntent)
        }
        builder.addAction(R.drawable.ic_stop, "Stop Service", stopPendingIntent)

        return builder.build()
    }

    fun updateNotification(isTorchOn: Boolean, hasPermissionError: Boolean = false) {
        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, buildForegroundNotification(isTorchOn, hasPermissionError))
    }
}`
  },
  {
    path: 'app/src/main/java/com/eonmirth/glim/camera/FlashlightController.kt',
    name: 'FlashlightController.kt',
    category: 'kotlin',
    description: 'Hardware CameraManager wrapper with robust SecurityException and CameraAccessException handling.',
    code: `package com.eonmirth.glim.camera

import android.content.Context
import android.hardware.camera2.CameraAccessException
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.util.Log
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Controller using Camera2 API CameraManager to toggle flashlight torch mode safely.
 */
class FlashlightController(private val context: Context) {

    companion object {
        private const val TAG = "FlashlightController"
    }

    private val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager
    private var cameraId: String? = null

    private val _isTorchOn = MutableStateFlow(false)
    val isTorchOnFlow: StateFlow<Boolean> = _isTorchOn.asStateFlow()

    val isTorchOn: Boolean
        get() = _isTorchOn.value

    private val torchCallback = object : CameraManager.TorchCallback() {
        override fun onTorchModeChanged(id: String, enabled: Boolean) {
            super.onTorchModeChanged(id, enabled)
            if (id == cameraId) {
                _isTorchOn.value = enabled
                Log.d(TAG, "Torch mode changed for camera $id -> $enabled")
            }
        }

        override fun onTorchModeUnavailable(id: String) {
            super.onTorchModeUnavailable(id)
            if (id == cameraId) {
                _isTorchOn.value = false
                Log.w(TAG, "Torch mode became unavailable for camera $id")
            }
        }
    }

    init {
        findFlashCameraId()
        try {
            cameraManager.registerTorchCallback(torchCallback, null)
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException registering torch callback", e)
        } catch (e: Exception) {
            Log.e(TAG, "Exception registering torch callback", e)
        }
    }

    private fun findFlashCameraId() {
        try {
            for (id in cameraManager.cameraIdList) {
                val characteristics = cameraManager.getCameraCharacteristics(id)
                val hasFlash = characteristics.get(CameraCharacteristics.FLASH_INFO_AVAILABLE) ?: false
                val facing = characteristics.get(CameraCharacteristics.LENS_FACING)

                // Prioritize back-facing camera with flash unit
                if (hasFlash && facing == CameraCharacteristics.LENS_FACING_BACK) {
                    cameraId = id
                    Log.d(TAG, "Found primary back camera with flash: ID=$id")
                    return
                }
            }

            // Fallback: any camera with flash
            if (cameraId == null) {
                for (id in cameraManager.cameraIdList) {
                    val characteristics = cameraManager.getCameraCharacteristics(id)
                    val hasFlash = characteristics.get(CameraCharacteristics.FLASH_INFO_AVAILABLE) ?: false
                    if (hasFlash) {
                        cameraId = id
                        Log.d(TAG, "Found fallback camera with flash: ID=$id")
                        return
                    }
                }
            }
        } catch (e: CameraAccessException) {
            Log.e(TAG, "Failed to inspect camera IDs: CameraAccessException", e)
        } catch (e: SecurityException) {
            Log.e(TAG, "Failed to inspect camera IDs: SecurityException (Camera permission revoked)", e)
        } catch (e: Exception) {
            Log.e(TAG, "Unexpected error inspecting camera IDs", e)
        }
    }

    fun setTorchMode(enabled: Boolean): Boolean {
        val targetId = cameraId ?: run {
            findFlashCameraId()
            cameraId
        }

        if (targetId == null) {
            Log.e(TAG, "Cannot toggle torch: No camera with flash found")
            return false
        }

        return try {
            cameraManager.setTorchMode(targetId, enabled)
            _isTorchOn.value = enabled
            true
        } catch (e: CameraAccessException) {
            Log.e(TAG, "CameraAccessException while setting torch mode to $enabled", e)
            false
        } catch (e: IllegalArgumentException) {
            Log.e(TAG, "IllegalArgumentException toggling torch", e)
            false
        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException while setting torch mode to $enabled: Camera permission revoked", e)
            _isTorchOn.value = false
            false
        }
    }

    fun toggleTorch(): Boolean {
        val desiredState = !_isTorchOn.value
        return setTorchMode(desiredState)
    }

    fun release() {
        try {
            cameraManager.unregisterTorchCallback(torchCallback)
        } catch (e: Exception) {
            Log.e(TAG, "Exception unregistering torch callback", e)
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/eonmirth/glim/service/GlimService.kt',
    name: 'GlimService.kt',
    category: 'kotlin',
    description: 'Core Foreground Service keeping accelerometer & proximity listeners alive, with permission loss protection.',
    code: `package com.eonmirth.glim.service

import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import com.eonmirth.glim.camera.FlashlightController
import com.eonmirth.glim.core.action.ActionResult
import com.eonmirth.glim.core.action.ToggleFlashlightAction
import com.eonmirth.glim.core.feature.FeatureId
import com.eonmirth.glim.core.log.ActivityLogManager
import com.eonmirth.glim.core.notification.SmartNotificationManager
import com.eonmirth.glim.core.permission.SmartPermissionManager
import com.eonmirth.glim.core.persistence.PreferencesManager
import com.eonmirth.glim.core.rule.SmartRule
import com.eonmirth.glim.core.safety.SafetyEngine
import com.eonmirth.glim.core.sensor.SensorEngine
import com.eonmirth.glim.core.sensor.SensorEventListenerCallback

/**
 * Continuous Foreground Service keeping accelerometer & proximity listeners alive
 * in the background/screen-off state, powered by the Smart Actions Foundation.
 */
class GlimService : Service(), SensorEventListenerCallback {

    companion object {
        const val TAG = "GlimService"
        const val CHANNEL_ID = SmartNotificationManager.CHANNEL_ID
        const val NOTIFICATION_ID = SmartNotificationManager.NOTIFICATION_ID

        const val ACTION_START = "ACTION_START"
        const val ACTION_STOP = "ACTION_STOP"
        const val ACTION_TOGGLE_TORCH = "ACTION_TOGGLE_TORCH"
        const val ACTION_UPDATE_SENSITIVITY = "ACTION_UPDATE_SENSITIVITY"
        const val EXTRA_SENSITIVITY = "EXTRA_SENSITIVITY"
        const val PREFS_NAME = PreferencesManager.PREFS_NAME

        var isServiceRunning = false
            private set
    }

    private lateinit var preferencesManager: PreferencesManager
    private lateinit var flashlightController: FlashlightController
    private lateinit var notificationManager: SmartNotificationManager
    private lateinit var safetyEngine: SafetyEngine
    private lateinit var toggleAction: ToggleFlashlightAction
    private lateinit var smartRule: SmartRule
    private lateinit var sensorEngine: SensorEngine

    private val autoOffHandler = Handler(Looper.getMainLooper())
    private val autoOffRunnable = Runnable {
        if (flashlightController.isTorchOn) {
            Log.d(TAG, "Auto-off timer triggered. Turning off torch.")
            flashlightController.setTorchMode(false)
            notificationManager.updateNotification(false)
            ActivityLogManager.log(
                FeatureId.SHAKE_FLASHLIGHT,
                "AUTO_OFF",
                "Flashlight turned off by auto-off timer",
                true
            )
        }
    }

    private var wakeLock: PowerManager.WakeLock? = null
    private var isInsidePocket = false

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Service onCreate()")

        preferencesManager = PreferencesManager(this)
        flashlightController = FlashlightController(this)
        notificationManager = SmartNotificationManager(this)
        notificationManager.createNotificationChannel()

        safetyEngine = SafetyEngine(cooldownMs = 600L)
        toggleAction = ToggleFlashlightAction(flashlightController)
        smartRule = SmartRule("RULE_SHAKE_FLASHLIGHT", FeatureId.SHAKE_FLASHLIGHT, "Shake", toggleAction)

        sensorEngine = SensorEngine(this, this).apply {
            sensitivityThresholdGForce = preferencesManager.sensitivityGForce
            isPocketProtectionEnabled = preferencesManager.isPocketProtectionEnabled
        }

        acquireWakeLock()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: ACTION_START

        when (action) {
            ACTION_STOP -> {
                Log.d(TAG, "Stopping foreground service")
                isServiceRunning = false
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_TOGGLE_TORCH -> {
                val result = toggleAction.execute(this)
                if (result is ActionResult.Success) {
                    vibrateTactileFeedback()
                    notificationManager.updateNotification(flashlightController.isTorchOn)
                    ActivityLogManager.log(
                        FeatureId.SHAKE_FLASHLIGHT,
                        "NOTIFICATION_TOGGLE",
                        "Flashlight toggled from notification action",
                        true
                    )
                    manageAutoOffTimer()
                } else {
                    val errorReason = (result as? ActionResult.Failure)?.reason
                        ?: (result as? ActionResult.Unavailable)?.reason
                        ?: "Operation failed"
                    Log.e(TAG, "Notification torch toggle failed: $errorReason")
                    val isPermRevoked = !SmartPermissionManager.hasCameraPermission(this)
                    notificationManager.updateNotification(
                        isTorchOn = false,
                        hasPermissionError = isPermRevoked
                    )
                    ActivityLogManager.log(
                        FeatureId.SHAKE_FLASHLIGHT,
                        "ACTION_FAILED",
                        "Notification toggle failed: $errorReason",
                        false
                    )
                }
            }
            ACTION_UPDATE_SENSITIVITY -> {
                val newSensitivity = intent?.getFloatExtra(EXTRA_SENSITIVITY, preferencesManager.sensitivityGForce)
                    ?: preferencesManager.sensitivityGForce
                sensorEngine.sensitivityThresholdGForce = newSensitivity
                preferencesManager.sensitivityGForce = newSensitivity
                Log.d(TAG, "Updated shake threshold: $newSensitivity G")
            }
            ACTION_START -> {
                if (!SmartPermissionManager.hasCameraPermission(this)) {
                    Log.e(TAG, "Cannot start foreground service: Camera permission missing or revoked")
                    ActivityLogManager.log(
                        FeatureId.SHAKE_FLASHLIGHT,
                        "START_FAILED",
                        "Cannot start service: Camera permission revoked",
                        false
                    )
                    stopSelf()
                    return START_NOT_STICKY
                }
                isServiceRunning = true
                startForeground(NOTIFICATION_ID, notificationManager.buildForegroundNotification(flashlightController.isTorchOn))
                sensorEngine.startListening()
                ActivityLogManager.log(
                    FeatureId.SHAKE_FLASHLIGHT,
                    "SERVICE_START",
                    "Shake flashlight background monitoring started",
                    true
                )
            }
        }

        return START_STICKY
    }

    override fun onPocketStateChanged(isInsidePocket: Boolean) {
        this.isInsidePocket = isInsidePocket
    }

    override fun onShakeDetected(gForce: Float) {
        val isAllowed = safetyEngine.canExecuteShakeAction(
            context = this,
            isInsidePocket = isInsidePocket,
            pocketProtectionEnabled = preferencesManager.isPocketProtectionEnabled
        )

        if (isAllowed) {
            Log.i(TAG, "Shake detected! G-force: $gForce. Executing flashlight rule.")
            val result = smartRule.evaluateAndExecute(this, true)
            if (result is ActionResult.Success) {
                vibrateTactileFeedback()
                notificationManager.updateNotification(flashlightController.isTorchOn)
                ActivityLogManager.log(
                    FeatureId.SHAKE_FLASHLIGHT,
                    "SHAKE_TRIGGER",
                    "Shake detected ($gForce G) -> Flashlight toggled",
                    true
                )
                manageAutoOffTimer()
            } else {
                val errorReason = (result as? ActionResult.Failure)?.reason
                    ?: (result as? ActionResult.Unavailable)?.reason
                    ?: "Operation failed"
                Log.e(TAG, "Shake trigger action failed: $errorReason")
                val isPermRevoked = !SmartPermissionManager.hasCameraPermission(this)
                notificationManager.updateNotification(
                    isTorchOn = false,
                    hasPermissionError = isPermRevoked
                )
                ActivityLogManager.log(
                    FeatureId.SHAKE_FLASHLIGHT,
                    "ACTION_FAILED",
                    "Shake detected but torch failed: $errorReason",
                    false
                )
            }
        }
    }

    private fun vibrateTactileFeedback() {
        val isTorchNowOn = flashlightController.isTorchOn
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            val vibrator = vibratorManager.defaultVibrator
            val effect = if (isTorchNowOn) {
                VibrationEffect.createWaveform(longArrayOf(0, 40, 50, 60), -1)
            } else {
                VibrationEffect.createOneShot(45, VibrationEffect.DEFAULT_AMPLITUDE)
            }
            vibrator.vibrate(effect)
        } else {
            @Suppress("DEPRECATION")
            val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createOneShot(50, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(50)
            }
        }
    }

    private fun manageAutoOffTimer() {
        autoOffHandler.removeCallbacks(autoOffRunnable)
        if (flashlightController.isTorchOn) {
            val minutes = preferencesManager.autoOffMinutes
            if (minutes > 0) {
                Log.d(TAG, "Starting auto-off timer: $minutes minutes")
                autoOffHandler.postDelayed(autoOffRunnable, minutes * 60 * 1000L)
            }
        }
    }

    private fun acquireWakeLock() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "Glim::SensorWakeLock"
        ).apply {
            setReferenceCounted(false)
            acquire(10 * 60 * 1000L) // Safe partial wakelock
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "Service onDestroy()")
        isServiceRunning = false
        autoOffHandler.removeCallbacks(autoOffRunnable)
        sensorEngine.stopListening()
        flashlightController.setTorchMode(false)
        flashlightController.release()

        try {
            if (wakeLock?.isHeld == true) {
                wakeLock?.release()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error releasing wakelock", e)
        }

        ActivityLogManager.log(
            FeatureId.SHAKE_FLASHLIGHT,
            "SERVICE_STOP",
            "Shake flashlight service stopped",
            true
        )
    }

    override fun onBind(intent: Intent?): IBinder? = null
}`
  },
  {
    path: 'app/src/main/java/com/eonmirth/glim/service/GlimTileService.kt',
    name: 'GlimTileService.kt',
    category: 'kotlin',
    description: 'Quick Settings Tile for toggling the Glim background service.',
    code: `package com.eonmirth.glim.service

import android.content.Intent
import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService
import androidx.core.content.ContextCompat
import com.eonmirth.glim.core.persistence.PreferencesManager

class GlimTileService : TileService() {

    override fun onStartListening() {
        super.onStartListening()
        updateTile()
    }

    override fun onClick() {
        super.onClick()
        val prefs = PreferencesManager(this)
        val newState = !prefs.isGlimEnabled
        prefs.isGlimEnabled = newState

        if (newState) {
            val intent = Intent(this, GlimService::class.java).apply {
                action = GlimService.ACTION_START
            }
            ContextCompat.startForegroundService(this, intent)
        } else {
            val intent = Intent(this, GlimService::class.java).apply {
                action = GlimService.ACTION_STOP
            }
            startService(intent)
        }
        updateTile()
    }

    private fun updateTile() {
        val tile = qsTile ?: return
        val prefs = PreferencesManager(this)
        val isEnabled = prefs.isGlimEnabled

        tile.state = if (isEnabled) Tile.STATE_ACTIVE else Tile.STATE_INACTIVE
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            tile.subtitle = if (isEnabled) "Shake active" else "Shake paused"
        }
        tile.updateTile()
    }
}`
  },
  {
    path: 'app/src/main/java/com/eonmirth/glim/core/update/UpdateManager.kt',
    name: 'UpdateManager.kt',
    category: 'kotlin',
    description: 'Handles in-app update checks by fetching a remote version JSON from the EonMirth server.',
    code: `package com.eonmirth.glim.core.update

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log
import com.eonmirth.glim.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

object UpdateManager {
    private const val TAG = "UpdateManager"
    private const val UPDATE_URL = "https://eonmirth-web.vercel.app/api/glim-version.json"

    data class UpdateInfo(
        val hasUpdate: Boolean,
        val latestVersionName: String,
        val apkUrl: String,
        val releaseNotes: String
    )

    suspend fun checkForUpdates(): UpdateInfo? = withContext(Dispatchers.IO) {
        try {
            val url = URL(UPDATE_URL)
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "GET"
            connection.connectTimeout = 5000
            connection.readTimeout = 5000

            if (connection.responseCode == HttpURLConnection.HTTP_OK) {
                val response = connection.inputStream.bufferedReader().use { it.readText() }
                val json = JSONObject(response)
                val latestVersionCode = json.getInt("versionCode")
                val currentVersionCode = BuildConfig.VERSION_CODE

                if (latestVersionCode > currentVersionCode) {
                    return@withContext UpdateInfo(
                        hasUpdate = true,
                        latestVersionName = json.getString("versionName"),
                        apkUrl = json.getString("apkUrl"),
                        releaseNotes = json.optString("releaseNotes", "New update available")
                    )
                }
            }
            return@withContext UpdateInfo(false, "", "", "")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to check for updates", e)
            null
        }
    }

    fun launchUpdate(context: Context, apkUrl: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(apkUrl))
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
    }
}`
  },
  {
    path: 'app/src/main/java/com/eonmirth/glim/MainActivity.kt',
    name: 'MainActivity.kt',
    category: 'kotlin',
    description: 'Jetpack Compose UI with feature-triggered permission workflows and graceful notification permission handling.',
    code: `package com.eonmirth.glim

import android.Manifest
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import com.eonmirth.glim.core.feature.FeatureId
import com.eonmirth.glim.core.feature.FeatureState
import com.eonmirth.glim.core.feature.FeatureStatus
import com.eonmirth.glim.core.hardware.HardwareCapabilities
import com.eonmirth.glim.core.permission.SmartPermissionManager
import com.eonmirth.glim.core.persistence.PreferencesManager
import com.eonmirth.glim.core.update.UpdateManager
import com.eonmirth.glim.service.GlimService
import com.eonmirth.glim.ui.GlimScreen
import com.eonmirth.glim.ui.theme.GlimTheme

class MainActivity : ComponentActivity() {

    private lateinit var preferencesManager: PreferencesManager
    private var isServiceRunning by mutableStateOf(false)
    private var hasCameraPermission by mutableStateOf(false)
    private var hasNotificationPermission by mutableStateOf(false)
    private var updateInfo by mutableStateOf<UpdateManager.UpdateInfo?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        preferencesManager = PreferencesManager(this)

        // Trigger update check
        lifecycleScope.launchWhenStarted {
            val info = UpdateManager.checkForUpdates()
            if (info?.hasUpdate == true) {
                updateInfo = info
            }
        }
        isServiceRunning = GlimService.isServiceRunning
        hasCameraPermission = SmartPermissionManager.hasCameraPermission(this)
        hasNotificationPermission = SmartPermissionManager.hasNotificationPermission(this)

        setContent {
            GlimTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val hasCameraFlash = remember { HardwareCapabilities.hasCameraFlash(this@MainActivity) }

                    // Feature state computation: notification denial results in LIMITED, not blocked
                    val featureState = remember(isServiceRunning, hasCameraFlash, hasCameraPermission, hasNotificationPermission, preferencesManager.isGlimEnabled) {
                        when {
                            !hasCameraFlash -> FeatureState(
                                FeatureId.SHAKE_FLASHLIGHT,
                                FeatureStatus.UNSUPPORTED,
                                "Flashlight hardware is not available on this device"
                            )
                            !hasCameraPermission && preferencesManager.isGlimEnabled -> FeatureState(
                                FeatureId.SHAKE_FLASHLIGHT,
                                FeatureStatus.PERMISSION_REQUIRED,
                                "Glim needs Camera permission only to access the flashlight hardware"
                            )
                            isServiceRunning || preferencesManager.isGlimEnabled -> {
                                if (!hasNotificationPermission) {
                                    FeatureState(
                                        FeatureId.SHAKE_FLASHLIGHT,
                                        FeatureStatus.LIMITED,
                                        "Shake detection active • Notifications disabled (foreground status is hidden)"
                                    )
                                } else {
                                    FeatureState(
                                        FeatureId.SHAKE_FLASHLIGHT,
                                        FeatureStatus.ENABLED,
                                        "Shake detection active in foreground and background"
                                    )
                                }
                            }
                            else -> FeatureState(
                                FeatureId.SHAKE_FLASHLIGHT,
                                FeatureStatus.DISABLED,
                                "Shake detection paused"
                            )
                        }
                    }

                    // Permission launcher: only CAMERA is critical. Notification denial does not block feature.
                    val permissionLauncher = rememberLauncherForActivityResult(
                        contract = ActivityResultContracts.RequestMultiplePermissions()
                    ) { _ ->
                        val cameraGranted = SmartPermissionManager.hasCameraPermission(this@MainActivity)
                        val notifGranted = SmartPermissionManager.hasNotificationPermission(this@MainActivity)
                        hasCameraPermission = cameraGranted
                        hasNotificationPermission = notifGranted

                        if (cameraGranted) {
                            preferencesManager.isGlimEnabled = true
                            startShakeService()
                            isServiceRunning = true
                            if (!notifGranted && Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                Toast.makeText(
                                    this@MainActivity,
                                    "Shake Flashlight enabled. Notifications are disabled, so foreground status is hidden.",
                                    Toast.LENGTH_LONG
                                ).show()
                            }
                        } else {
                            preferencesManager.isGlimEnabled = false
                            Toast.makeText(
                                this@MainActivity,
                                "Camera permission is required to operate the flashlight torch",
                                Toast.LENGTH_SHORT
                            ).show()
                        }
                    }

                    GlimScreen(
                        featureState = featureState,
                        isServiceRunning = isServiceRunning,
                        initialSensitivity = preferencesManager.sensitivityGForce,
                        initialPocketProtection = preferencesManager.isPocketProtectionEnabled,
                        initialAutoOffMinutes = preferencesManager.autoOffMinutes,
                        onRequestPermissions = {
                            val perms = mutableListOf(Manifest.permission.CAMERA)
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && !hasNotificationPermission) {
                                perms.add(Manifest.permission.POST_NOTIFICATIONS)
                            }
                            permissionLauncher.launch(perms.toTypedArray())
                        },
                        onToggleService = { enable ->
                            if (enable) {
                                if (!hasCameraPermission) {
                                    val perms = mutableListOf(Manifest.permission.CAMERA)
                                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && !hasNotificationPermission) {
                                        perms.add(Manifest.permission.POST_NOTIFICATIONS)
                                    }
                                    permissionLauncher.launch(perms.toTypedArray())
                                } else {
                                    preferencesManager.isGlimEnabled = true
                                    startShakeService()
                                    isServiceRunning = true
                                }
                            } else {
                                preferencesManager.isGlimEnabled = false
                                stopShakeService()
                                isServiceRunning = false
                            }
                        },
                        onUpdateSensitivity = { sensitivityG ->
                            preferencesManager.sensitivityGForce = sensitivityG
                            if (GlimService.isServiceRunning) {
                                val intent = Intent(this@MainActivity, GlimService::class.java).apply {
                                    action = GlimService.ACTION_UPDATE_SENSITIVITY
                                    putExtra(GlimService.EXTRA_SENSITIVITY, sensitivityG)
                                }
                                startService(intent)
                            }
                        },
                        onTogglePocketProtection = { enable ->
                            preferencesManager.isPocketProtectionEnabled = enable
                        },
                        onUpdateAutoOff = { minutes ->
                            preferencesManager.autoOffMinutes = minutes
                        },
                        updateInfo = updateInfo,
                        onConfirmUpdate = { url ->
                            UpdateManager.launchUpdate(this@MainActivity, url)
                        }
                    )
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        hasCameraPermission = SmartPermissionManager.hasCameraPermission(this)
        hasNotificationPermission = SmartPermissionManager.hasNotificationPermission(this)

        // If camera permission was revoked while backgrounded, stop service safely
        // and immediately refresh the visible feature state.
        if (!hasCameraPermission && preferencesManager.isGlimEnabled) {
            stopShakeService()
            isServiceRunning = false
        }

        checkBatteryOptimization()
    }

    private fun checkBatteryOptimization() {
        if (preferencesManager.isGlimEnabled) {
            val powerManager = getSystemService(POWER_SERVICE) as android.os.PowerManager
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                if (!powerManager.isIgnoringBatteryOptimizations(packageName)) {
                    Toast.makeText(this, "Note: Glim works better if Battery Optimization is disabled", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun startShakeService() {
        val intent = Intent(this, GlimService::class.java).apply {
            action = GlimService.ACTION_START
        }
        ContextCompat.startForegroundService(this, intent)
    }

    private fun stopShakeService() {
        val intent = Intent(this, GlimService::class.java).apply {
            action = GlimService.ACTION_STOP
        }
        startService(intent)
    }
}`
  },
  {
    path: 'app/src/main/java/com/eonmirth/glim/ui/GlimScreen.kt',
    name: 'GlimScreen.kt',
    category: 'kotlin',
    description: 'Jetpack Compose Screen implementing UI with honest status reporting for Limited (notifications disabled) and Permission Required.',
    code: `package com.eonmirth.glim.ui

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.NotificationsOff
import androidx.compose.material.icons.filled.QuestionMark
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Vibration
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.eonmirth.glim.core.feature.FeatureState
import com.eonmirth.glim.core.feature.FeatureStatus

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GlimScreen(
    featureState: FeatureState,
    isServiceRunning: Boolean,
    initialSensitivity: Float = 2.4f,
    initialPocketProtection: Boolean = true,
    initialAutoOffMinutes: Int = 3,
    onRequestPermissions: () -> Unit,
    onToggleService: (Boolean) -> Unit,
    onUpdateSensitivity: (Float) -> Unit,
    onTogglePocketProtection: (Boolean) -> Unit = {},
    onUpdateAutoOff: (Int) -> Unit = {},
    updateInfo: UpdateManager.UpdateInfo? = null,
    onConfirmUpdate: (String) -> Unit = {}
) {
    val isEnabled = featureState.status == FeatureStatus.ENABLED || featureState.status == FeatureStatus.LIMITED
    val isUnsupported = featureState.status == FeatureStatus.UNSUPPORTED
    val isPermissionRequired = featureState.status == FeatureStatus.PERMISSION_REQUIRED
    val isLimited = featureState.status == FeatureStatus.LIMITED

    var sensitivitySlider by remember { mutableStateOf(initialSensitivity) }
    var isPocketProtectionEnabled by remember { mutableStateOf(initialPocketProtection) }
    var autoOffMinutes by remember { mutableStateOf(initialAutoOffMinutes) }
    var showTroubleshooting by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        "Glim",
                        fontWeight = FontWeight.Black,
                        fontSize = 24.sp,
                        letterSpacing = 1.sp
                    )
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {

            // Main Toggle Card (Material 3 style)
            Surface(
                onClick = { if (!isUnsupported) onToggleService(!isEnabled) },
                shape = RoundedCornerShape(28.dp),
                color = if (isEnabled) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .padding(24.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(CircleShape)
                            .background(
                                if (isEnabled) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline.copy(alpha = 0.2f)
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.FlashOn,
                            contentDescription = null,
                            tint = if (isEnabled) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(28.dp)
                        )
                    }

                    Spacer(modifier = Modifier.width(20.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = if (isEnabled) "Active" else "Paused",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Shake to toggle flashlight",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Switch(
                        checked = isEnabled,
                        enabled = !isUnsupported,
                        onCheckedChange = { onToggleService(it) }
                    )
                }
            }

            // Status Info
            if (isUnsupported) {
                StatusBanner(
                    icon = Icons.Default.Warning,
                    message = featureState.message ?: "Hardware not supported",
                    containerColor = MaterialTheme.colorScheme.errorContainer,
                    contentColor = MaterialTheme.colorScheme.onErrorContainer
                )
            } else if (isPermissionRequired) {
                Surface(
                    shape = RoundedCornerShape(24.dp),
                    color = MaterialTheme.colorScheme.tertiaryContainer,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Text("Permission Required", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                        Text("Camera access is needed to use the flash.", style = MaterialTheme.typography.bodySmall)
                        Spacer(modifier = Modifier.height(12.dp))
                        Button(onClick = onRequestPermissions) {
                            Text("Grant Permission")
                        }
                    }
                }
            }

            // Settings Section
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Text(
                    "Settings",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(start = 8.dp)
                )

                // Sensitivity
                SettingCard {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Vibration, null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                            Spacer(Modifier.width(12.dp))
                            Text("Shake Sensitivity", style = MaterialTheme.typography.titleMedium)
                        }
                        Slider(
                            value = sensitivitySlider,
                            onValueChange = { sensitivitySlider = it; onUpdateSensitivity(it) },
                            valueRange = 1.4f..3.8f,
                            steps = 11
                        )
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Light", style = MaterialTheme.typography.labelSmall)
                            Text(String.format("%.1f G", sensitivitySlider), style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                            Text("Firm", style = MaterialTheme.typography.labelSmall)
                        }
                    }
                }

                // Auto-off Timer
                SettingCard {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.NotificationsActive, null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp))
                            Spacer(Modifier.width(12.dp))
                            Text("Auto-off Timer", style = MaterialTheme.typography.titleMedium)
                        }

                        var expanded by remember { mutableStateOf(false) }
                        Box {
                            TextButton(onClick = { expanded = true }) {
                                Text(if (autoOffMinutes > 0) "$autoOffMinutes min" else "Never")
                            }
                            DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                                listOf(1, 3, 5, 10, 0).forEach { mins ->
                                    DropdownMenuItem(
                                        text = { Text(if (mins > 0) "$mins minutes" else "Never") },
                                        onClick = {
                                            autoOffMinutes = mins
                                            onUpdateAutoOff(mins)
                                            expanded = false
                                        }
                                    )
                                }
                            }
                        }
                    }
                }

                // Pocket Protection
                SettingCard {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                            Icon(Icons.Default.Security, null, tint = Color(0xFF4CAF50), modifier = Modifier.size(20.dp))
                            Spacer(Modifier.width(12.dp))
                            Column {
                                Text("Pocket Protection", style = MaterialTheme.typography.titleMedium)
                                Text("Avoid accidental activation", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                        Switch(checked = isPocketProtectionEnabled, onCheckedChange = { isPocketProtectionEnabled = it; onTogglePocketProtection(it) })
                    }
                }

                // Troubleshooting for Redmi/MIUI
                SettingCard {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                            .clickable { showTroubleshooting = true },
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.QuestionMark, null, tint = MaterialTheme.colorScheme.secondary, modifier = Modifier.size(20.dp))
                            Spacer(Modifier.width(12.dp))
                            Column {
                                Text("Not working on your phone?", style = MaterialTheme.typography.titleMedium)
                                Text("Click for Redmi/Xiaomi & Samsung fix", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                }
            }

            if (showTroubleshooting) {
                AlertDialog(
                    onDismissRequest = { showTroubleshooting = false },
                    title = { Text("Troubleshooting") },
                    text = {
                        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                            Text("Redmi/Xiaomi/Samsung phones often kill background apps to save battery.", fontWeight = FontWeight.Bold)
                            Text("1. Long press Glim icon on home screen")
                            Text("2. Click 'App Info'")
                            Text("3. Go to 'Battery Saver'")
                            Text("4. Select 'No Restrictions'")
                            Text("5. Enable 'Auto-start' (if available)")
                        }
                    },
                    confirmButton = {
                        TextButton(onClick = { showTroubleshooting = false }) {
                            Text("Got it")
                        }
                    }
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            if (updateInfo != null) {
                UpdateDialog(info = updateInfo, onConfirm = onConfirmUpdate)
            }

            Text(
                "Glim • Shake to Light",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.outline
            )
        }
    }
}

@Composable
fun SettingCard(content: @Composable () -> Unit) {
    Surface(
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f),
        modifier = Modifier.fillMaxWidth(),
        content = content
    )
}

@Composable
fun StatusBanner(icon: androidx.compose.ui.graphics.vector.ImageVector, message: String, containerColor: Color, contentColor: Color) {
    Surface(
        shape = RoundedCornerShape(16.dp),
        color = containerColor,
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, null, tint = contentColor)
            Spacer(Modifier.width(12.dp))
            Text(message, style = MaterialTheme.typography.bodyMedium, color = contentColor)
        }
    }
}

@Composable
fun UpdateDialog(info: UpdateManager.UpdateInfo, onConfirm: (String) -> Unit) {
    AlertDialog(
        onDismissRequest = { },
        title = { Text("Update Available") },
        text = { Text("A new version of Glim (${info.latestVersionName}) is available. It is recommended to update for new features and bug fixes.\n\nNotes: ${info.releaseNotes}") },
        confirmButton = {
            Button(onClick = { onConfirm(info.apkUrl) }) {
                Text("Update Now")
            }
        },
        dismissButton = {
            TextButton(onClick = { /* Could add a ignore logic here */ }) {
                Text("Later")
            }
        }
    )
}
`
  },
  {
    path: 'app/build.gradle.kts',
    name: 'build.gradle.kts (app)',
    category: 'gradle',
    description: 'Gradle configuration with Jetpack Compose Material 3, AndroidX Lifecycle, and Target SDK 35.',
    code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.eonmirth.glim"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.eonmirth.glim"
        minSdk = 24
        targetSdk = 35
        versionCode = 2
        versionName = "1.0.1"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)

    // Coroutines & Lifecycle
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.androidx.lifecycle.service)

    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}`
  },
  {
    path: 'gradle/libs.versions.toml',
    name: 'libs.versions.toml',
    category: 'gradle',
    description: 'Version catalog for Android Gradle Plugin, Kotlin, Compose, and AndroidX libraries.',
    code: `[versions]
agp = "8.13.2"
kotlin = "2.0.21"
coreKtx = "1.15.0"
junit = "4.13.2"
junitVersion = "1.2.1"
espressoCore = "3.6.1"
lifecycleRuntimeKtx = "2.8.7"
activityCompose = "1.9.3"
composeBom = "2024.11.00"
coroutines = "1.9.0"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
junit = { group = "junit", name = "junit", version.ref = "junit" }
androidx-junit = { group = "androidx.test.ext", name = "junit", version.ref = "junitVersion" }
androidx-espresso-core = { group = "androidx.test.espresso", name = "espresso-core", version.ref = "espressoCore" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-lifecycle-service = { group = "androidx.lifecycle", name = "lifecycle-service", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-compose-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-compose-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-compose-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-compose-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-compose-ui-test-manifest = { group = "androidx.compose.ui", name = "ui-test-manifest" }
androidx-compose-ui-test-junit4 = { group = "androidx.compose.ui", name = "ui-test-junit4" }
androidx-compose-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-compose-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-compose = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }`
  },
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    category: 'gradle',
    description: 'Gradle project settings defining Google and Maven Central repositories.',
    code: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "Glim"
include(":app")`
  }
];

/** Files required by Android Gradle that are not shown in the in-app source viewer. */
export const ANDROID_SUPPORT_FILES: AndroidFile[] = [
  { path: 'app/src/main/res/values/strings.xml', name: 'strings.xml', category: 'resource', description: 'App name and product attribution.', code: `<?xml version="1.0" encoding="utf-8"?>
<resources><string name="app_name">Glim</string><string name="app_brand">EonMirth</string></resources>` },
  { path: 'app/src/main/res/values/themes.xml', name: 'themes.xml', category: 'resource', description: 'Material 3 compatible application theme.', code: `<?xml version="1.0" encoding="utf-8"?>
<resources><style name="Theme.Glim" parent="android:style/Theme.Material.NoActionBar"><item name="android:windowLightStatusBar">false</item><item name="android:statusBarColor">@android:color/transparent</item><item name="android:navigationBarColor">@android:color/black</item></style></resources>` },
  { path: 'app/src/main/res/xml/backup_rules.xml', name: 'backup_rules.xml', category: 'resource', description: 'Android backup rules.', code: `<?xml version="1.0" encoding="utf-8"?>
<full-backup-content><include domain="sharedpref" path="." /></full-backup-content>` },
  { path: 'app/src/main/res/xml/data_extraction_rules.xml', name: 'data_extraction_rules.xml', category: 'resource', description: 'Android 12+ data extraction rules.', code: `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules><cloud-backup><include domain="sharedpref" path="." /></cloud-backup><device-transfer><include domain="sharedpref" path="." /></device-transfer></data-extraction-rules>` },
  { path: 'app/proguard-rules.pro', name: 'proguard-rules.pro', category: 'gradle', description: 'Release shrinker rules.', code: `-keep class com.eonmirth.glim.service.** { *; }
-keep class com.eonmirth.glim.receiver.** { *; }
-keep class com.eonmirth.glim.MainActivity { *; }` },
  { path: 'app/src/main/res/drawable/ic_launcher.xml', name: 'ic_launcher.xml', category: 'resource', description: 'Temporary vector launcher icon.', code: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108"><path android:fillColor="#0C0D0E" android:pathData="M0,0h108v108h-108z"/><path android:fillColor="#FBBF24" android:pathData="M54,25L25,65h20v25l29,-40h-20z"/></vector>` },
  { path: 'app/src/main/res/drawable/ic_flashlight_notif.xml', name: 'ic_flashlight_notif.xml', category: 'resource', description: 'Notification icon.', code: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24"><path android:fillColor="#FFFFFF" android:pathData="M7,2v11h3v9l7,-12h-4l3,-8z"/></vector>` },
  { path: 'app/src/main/res/drawable/ic_toggle.xml', name: 'ic_toggle.xml', category: 'resource', description: 'Toggle icon.', code: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24"><path android:fillColor="#FFFFFF" android:pathData="M17,7H7c-2.76,0 -5,2.24 -5,5s2.24,5 5,5h10c2.76,0 5,-2.24 5,-5s-2.24,-5 -5,-5zM17,15c-1.66,0 -3,-1.34 -3,-3s1.34,-3 3,-3 3,1.34 3,3 -1.34,3 -3,3z"/></vector>` },
  { path: 'app/src/main/res/drawable/ic_stop.xml', name: 'ic_stop.xml', category: 'resource', description: 'Stop icon.', code: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24"><path android:fillColor="#FFFFFF" android:pathData="M6,6h12v12H6z"/></vector>` },
  { path: 'app/src/main/java/com/eonmirth/glim/ui/theme/Theme.kt', name: 'Theme.kt', category: 'kotlin', description: 'Compose Material 3 color theme.', code: `package com.eonmirth.glim.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val EonMirthDarkScheme = darkColorScheme(
    primary = Color(0xFFFBBF24),
    secondary = Color(0xFFFFD166),
    background = Color(0xFF0C0D0E),
    surface = Color(0xFF151719)
)

@Composable
fun GlimTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = EonMirthDarkScheme, content = content)
}` },
  { path: 'app/src/main/java/com/eonmirth/glim/receiver/BootCompletedReceiver.kt', name: 'BootCompletedReceiver.kt', category: 'kotlin', description: 'Restarts the service only when the user had enabled it and camera permission is intact.', code: `package com.eonmirth.glim.receiver

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import com.eonmirth.glim.core.persistence.PreferencesManager
import com.eonmirth.glim.core.update.UpdateManager
import com.eonmirth.glim.service.GlimService

class BootCompletedReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return
        val prefs = PreferencesManager(context)
        val hasCameraPermission = ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED

        if (prefs.isGlimEnabled && hasCameraPermission) {
            ContextCompat.startForegroundService(
                context,
                Intent(context, GlimService::class.java).apply {
                    action = GlimService.ACTION_START
                }
            )
        }
    }
}` }
];
