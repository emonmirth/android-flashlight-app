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
    package="com.flashlight.shake">

    <!-- Permissions for Camera Flashlight & Foreground Service -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />

    <!-- Hardware Features -->
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
        android:theme="@style/Theme.ShakeFlashlight"
        tools:targetApi="35">

        <!-- Main Compose Activity -->
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="@string/app_name"
            android:theme="@style/Theme.ShakeFlashlight">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Continuous Foreground Service for Shake Gestures -->
        <service
            android:name=".service.ShakeFlashlightService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="specialUse">
            <property
                android:name="android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE"
                android:value="Background sensor monitoring to trigger flashlight on shake gesture" />
        </service>

        <receiver
            android:name=".receiver.BootCompletedReceiver"
            android:enabled="true"
            android:exported="false">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

    </application>
</manifest>`
  },
  {
    path: 'app/src/main/java/com/flashlight/shake/service/ShakeFlashlightService.kt',
    name: 'ShakeFlashlightService.kt',
    category: 'kotlin',
    description: 'Core Foreground Service keeping accelerometer & proximity listeners alive in the background/screen-off state.',
    code: `package com.flashlight.shake.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import androidx.core.app.NotificationCompat
import com.flashlight.shake.MainActivity
import com.flashlight.shake.R
import com.flashlight.shake.camera.FlashlightController
import kotlin.math.sqrt

/**
 * Continuous Foreground Service that registers Sensor.TYPE_ACCELEROMETER
 * and Sensor.TYPE_PROXIMITY to safely toggle CameraManager torch mode.
 */
class ShakeFlashlightService : Service(), SensorEventListener {

    companion object {
        const val TAG = "ShakeFlashlightService"
        const val CHANNEL_ID = "shake_flashlight_foreground"
        const val NOTIFICATION_ID = 1001

        const val ACTION_START = "ACTION_START"
        const val ACTION_STOP = "ACTION_STOP"
        const val ACTION_TOGGLE_TORCH = "ACTION_TOGGLE_TORCH"
        const val ACTION_UPDATE_SENSITIVITY = "ACTION_UPDATE_SENSITIVITY"
        const val EXTRA_SENSITIVITY = "EXTRA_SENSITIVITY"
        const val PREFS_NAME = "shake_flashlight_prefs"

        var isServiceRunning = false
            private set
    }

    private lateinit var sensorManager: SensorManager
    private var accelerometer: Sensor? = null
    private var proximitySensor: Sensor? = null
    private lateinit var flashlightController: FlashlightController
    private var wakeLock: PowerManager.WakeLock? = null
    private lateinit var sharedPreferences: SharedPreferences

    // State tracking
    private var isInsidePocket = false
    private var shakeThresholdGForce = 2.4f // Default moderate sensitivity (in Gs)
    private var lastShakeTimestamp: Long = 0
    private val SHAKE_COOLDOWN_MS = 600L

    override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Service onCreate()")
        sharedPreferences = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        shakeThresholdGForce = sharedPreferences.getFloat("sensitivity_g_force", 2.4f)

        flashlightController = FlashlightController(this)
        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        proximitySensor = sensorManager.getDefaultSensor(Sensor.TYPE_PROXIMITY)

        createNotificationChannel()
        acquireWakeLock()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action ?: ACTION_START

        when (action) {
            ACTION_STOP -> {
                Log.d(TAG, "Stopping foreground service")
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_TOGGLE_TORCH -> {
                flashlightController.toggleTorch()
                vibrateTactileFeedback()
                updateNotification()
            }
            ACTION_UPDATE_SENSITIVITY -> {
                val newSensitivity = intent.getFloatExtra(EXTRA_SENSITIVITY, shakeThresholdGForce)
                shakeThresholdGForce = newSensitivity
                Log.d(TAG, "Updated shake threshold: $shakeThresholdGForce G")
            }
            ACTION_START -> {
                isServiceRunning = true
                startForeground(NOTIFICATION_ID, buildForegroundNotification())
                registerSensors()
            }
        }

        return START_STICKY
    }

    private fun registerSensors() {
        accelerometer?.let {
            sensorManager.registerListener(
                this,
                it,
                SensorManager.SENSOR_DELAY_GAME
            )
            Log.d(TAG, "Accelerometer registered with SENSOR_DELAY_GAME")
        }

        proximitySensor?.let {
            sensorManager.registerListener(
                this,
                it,
                SensorManager.SENSOR_DELAY_NORMAL
            )
            Log.d(TAG, "Proximity Sensor registered")
        }
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null) return

        when (event.sensor.type) {
            Sensor.TYPE_PROXIMITY -> {
                val distance = event.values[0]
                val maxRange = event.sensor.maximumRange
                // If distance is less than max range (typically 0cm to 5cm), phone is covered or in pocket
                isInsidePocket = distance < maxRange && distance < 4.0f
                Log.d(TAG, "Proximity changed: distance=$distance, isInsidePocket=$isInsidePocket")
            }

            Sensor.TYPE_ACCELEROMETER -> {
                // If phone is in pocket or bag, ignore shake gestures
                if (isInsidePocket) {
                    return
                }

                val x = event.values[0]
                val y = event.values[1]
                val z = event.values[2]

                // Calculate vector magnitude in G-force units
                val gX = x / SensorManager.GRAVITY_EARTH
                val gY = y / SensorManager.GRAVITY_EARTH
                val gZ = z / SensorManager.GRAVITY_EARTH

                val gForce = sqrt((gX * gX + gY * gY + gZ * gZ).toDouble()).toFloat()

                // Shake detection logic with cooldown debouncing
                if (gForce >= shakeThresholdGForce) {
                    val currentTime = System.currentTimeMillis()
                    if (currentTime - lastShakeTimestamp > SHAKE_COOLDOWN_MS) {
                        lastShakeTimestamp = currentTime
                        Log.i(TAG, "Shake detected! G-force: $gForce >= $shakeThresholdGForce. Toggling torch.")
                        handleShakeGesture()
                    }
                }
            }
        }
    }

    private fun handleShakeGesture() {
        val newState = flashlightController.toggleTorch()
        vibrateTactileFeedback()
        updateNotification()
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

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    private fun acquireWakeLock() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "ShakeFlashlight::SensorWakeLock"
        ).apply {
            setReferenceCounted(false)
            acquire(10 * 60 * 1000L) // Safe partial wakelock
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Shake Flashlight Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps shake-to-activate flashlight gesture active in the background"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildForegroundNotification(): Notification {
        val openAppIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val openAppPendingIntent = PendingIntent.getActivity(
            this, 0, openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val toggleIntent = Intent(this, ShakeFlashlightService::class.java).apply {
            action = ACTION_TOGGLE_TORCH
        }
        val togglePendingIntent = PendingIntent.getService(
            this, 1, toggleIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(this, ShakeFlashlightService::class.java).apply {
            action = ACTION_STOP
        }
        val stopPendingIntent = PendingIntent.getService(
            this, 2, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val isTorchOn = flashlightController.isTorchOn
        val statusText = if (isTorchOn) "Flashlight is ON • Shake to turn off" else "Shake device to turn flashlight ON"
        val toggleActionTitle = if (isTorchOn) "Turn Off" else "Turn On"

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Shake Flashlight Active")
            .setContentText(statusText)
            .setSmallIcon(R.drawable.ic_flashlight_notif)
            .setOngoing(true)
            .setContentIntent(openAppPendingIntent)
            .addAction(R.drawable.ic_toggle, toggleActionTitle, togglePendingIntent)
            .addAction(R.drawable.ic_stop, "Stop Service", stopPendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build()
    }

    private fun updateNotification() {
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, buildForegroundNotification())
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d(TAG, "Service onDestroy()")
        isServiceRunning = false
        sensorManager.unregisterListener(this)
        flashlightController.setTorchMode(false)
        flashlightController.release()

        try {
            if (wakeLock?.isHeld == true) {
                wakeLock?.release()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error releasing wakelock", e)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}`
  },
  {
    path: 'app/src/main/java/com/flashlight/shake/camera/FlashlightController.kt',
    name: 'FlashlightController.kt',
    category: 'kotlin',
    description: 'Hardware CameraManager wrapper managing torch callbacks, camera ID lookup, and state flows.',
    code: `package com.flashlight.shake.camera

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
        cameraManager.registerTorchCallback(torchCallback, null)
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
            Log.e(TAG, "Failed to inspect camera IDs", e)
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
        }
    }

    fun toggleTorch(): Boolean {
        val desiredState = !_isTorchOn.value
        return setTorchMode(desiredState)
    }

    fun release() {
        cameraManager.unregisterTorchCallback(torchCallback)
    }
}`
  },
  {
    path: 'app/src/main/java/com/flashlight/shake/MainActivity.kt',
    name: 'MainActivity.kt',
    category: 'kotlin',
    description: 'Modern Jetpack Compose UI with Material 3 switch, sensitivity slider, and permission workflows.',
    code: `package com.flashlight.shake

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
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
import com.flashlight.shake.service.ShakeFlashlightService
import com.flashlight.shake.ui.ShakeFlashlightScreen
import com.flashlight.shake.ui.theme.ShakeFlashlightTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            ShakeFlashlightTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    var hasCameraPermission by remember {
                        mutableStateOf(
                            ContextCompat.checkSelfPermission(
                                this@MainActivity,
                                Manifest.permission.CAMERA
                            ) == PackageManager.PERMISSION_GRANTED
                        )
                    }

                    var hasNotificationPermission by remember {
                        mutableStateOf(
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                                ContextCompat.checkSelfPermission(
                                    this@MainActivity,
                                    Manifest.permission.POST_NOTIFICATIONS
                                ) == PackageManager.PERMISSION_GRANTED
                            } else true
                        )
                    }

                    val requestPermissionLauncher = rememberLauncherForActivityResult(
                        contract = ActivityResultContracts.RequestMultiplePermissions()
                    ) { permissions ->
                        hasCameraPermission = permissions[Manifest.permission.CAMERA] ?: hasCameraPermission
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            hasNotificationPermission = permissions[Manifest.permission.POST_NOTIFICATIONS]
                                ?: hasNotificationPermission
                        }
                    }

                    LaunchedEffect(Unit) {
                        val permissionsNeeded = mutableListOf<String>()
                        if (!hasCameraPermission) permissionsNeeded.add(Manifest.permission.CAMERA)
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && !hasNotificationPermission) {
                            permissionsNeeded.add(Manifest.permission.POST_NOTIFICATIONS)
                        }
                        if (permissionsNeeded.isNotEmpty()) {
                            requestPermissionLauncher.launch(permissionsNeeded.toTypedArray())
                        }
                    }

                    ShakeFlashlightScreen(
                        isServiceRunning = ShakeFlashlightService.isServiceRunning,
                        onToggleService = { enable ->
                            getSharedPreferences(ShakeFlashlightService.PREFS_NAME, Context.MODE_PRIVATE)
                                .edit().putBoolean("service_enabled", enable).apply()
                            val intent = Intent(this@MainActivity, ShakeFlashlightService::class.java).apply {
                                action = if (enable) ShakeFlashlightService.ACTION_START else ShakeFlashlightService.ACTION_STOP
                            }
                            if (enable) {
                                ContextCompat.startForegroundService(this@MainActivity, intent)
                            } else {
                                startService(intent)
                            }
                        },
                        onUpdateSensitivity = { sensitivityG ->
                            val prefs = getSharedPreferences(ShakeFlashlightService.PREFS_NAME, Context.MODE_PRIVATE)
                            prefs.edit().putFloat("sensitivity_g_force", sensitivityG).apply()

                            if (ShakeFlashlightService.isServiceRunning) {
                                val intent = Intent(this@MainActivity, ShakeFlashlightService::class.java).apply {
                                    action = ShakeFlashlightService.ACTION_UPDATE_SENSITIVITY
                                    putExtra(ShakeFlashlightService.EXTRA_SENSITIVITY, sensitivityG)
                                }
                                startService(intent)
                            }
                        }
                    )
                }
            }
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/flashlight/shake/ui/ShakeFlashlightScreen.kt',
    name: 'ShakeFlashlightScreen.kt',
    category: 'kotlin',
    description: 'Jetpack Compose Screen implementing the Material 3 UI: Torch Hero Graphic, Master Switch, Sensitivity Slider, and Pocket Protection card.',
    code: `package com.flashlight.shake.ui

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
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Vibration
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShakeFlashlightScreen(
    isServiceRunning: Boolean,
    onToggleService: (Boolean) -> Unit,
    onUpdateSensitivity: (Float) -> Unit
) {
    var serviceEnabled by remember { mutableStateOf(isServiceRunning) }
    var sensitivitySlider by remember { mutableStateOf(2.4f) } // 1.4f (Sensitive) to 4.0f (Firm)
    var isPocketProtectionEnabled by remember { mutableStateOf(true) }

    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val glowAlpha by infiniteTransition.animateFloat(
        initialValue = 0.35f,
        targetValue = 0.85f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "glow"
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Shake Flashlight",
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {

            // Central Torch Visual Indicator
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .padding(vertical = 12.dp)
                    .size(170.dp)
            ) {
                if (serviceEnabled) {
                    Box(
                        modifier = Modifier
                            .size(160.dp)
                            .clip(CircleShape)
                            .background(
                                Brush.radialGradient(
                                    colors = listOf(
                                        Color(0xFFFFD54F).copy(alpha = glowAlpha),
                                        Color.Transparent
                                    )
                                )
                            )
                    )
                }

                Box(
                    modifier = Modifier
                        .size(110.dp)
                        .clip(CircleShape)
                        .background(
                            if (serviceEnabled) Color(0xFFFFC107) else MaterialTheme.colorScheme.surfaceVariant
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.FlashOn,
                        contentDescription = "Flashlight Status",
                        modifier = Modifier.size(54.dp),
                        tint = if (serviceEnabled) Color(0xFF1E1E1E) else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // Master Service Switch Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(
                    containerColor = if (serviceEnabled) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = if (serviceEnabled) "Shake Detection Active" else "Shake Detection Paused",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = if (serviceEnabled) "Foreground Service listening for shake gestures" else "Turn on to listen in background and screen-off",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }

                    Switch(
                        checked = serviceEnabled,
                        onCheckedChange = { checked ->
                            serviceEnabled = checked
                            onToggleService(checked)
                        }
                    )
                }
            }

            // Sensitivity Adjustment Slider Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Vibration,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Shake Sensitivity",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.SemiBold
                            )
                        }

                        val presetLabel = when {
                            sensitivitySlider < 2.0f -> "Gentle"
                            sensitivitySlider < 3.0f -> "Balanced"
                            else -> "Firm"
                        }
                        SuggestionChip(
                            onClick = {},
                            label = { Text(presetLabel, fontSize = 12.sp) }
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Slider(
                        value = sensitivitySlider,
                        onValueChange = { value ->
                            sensitivitySlider = value
                            onUpdateSensitivity(value)
                        },
                        valueRange = 1.4f..3.8f,
                        steps = 11
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("Gentle (Light shake)", style = MaterialTheme.typography.labelSmall)
                        Text(String.format("%.1f G", sensitivitySlider), style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Bold)
                        Text("Firm (Strong shake)", style = MaterialTheme.typography.labelSmall)
                    }
                }
            }

            // Pocket & Bag Proximity Protection Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Security,
                            contentDescription = null,
                            tint = Color(0xFF4CAF50),
                            modifier = Modifier.size(22.dp)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Pocket Protection",
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = "Uses Proximity Sensor to suppress shakes inside pockets or bags",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Switch(
                        checked = isPocketProtectionEnabled,
                        onCheckedChange = { isPocketProtectionEnabled = it }
                    )
                }
            }

            // Foreground Service Info Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f))
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.NotificationsActive,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "A persistent notification ensures Android doesn't kill the sensor listener when in standby.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}`
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
    namespace = "com.flashlight.shake"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.flashlight.shake"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
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
agp = "8.7.3"
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

rootProject.name = "ShakeFlashlight"
include(":app")`
  }
];

/** Files required by Android Gradle that are not shown in the in-app source viewer. */
export const ANDROID_SUPPORT_FILES: AndroidFile[] = [
  { path: 'app/src/main/res/values/strings.xml', name: 'strings.xml', category: 'resource', description: 'App name and product attribution.', code: `<?xml version="1.0" encoding="utf-8"?>
<resources><string name="app_name">EonMirth Flashlight</string><string name="app_brand">EonMirth</string></resources>` },
  { path: 'app/src/main/res/values/themes.xml', name: 'themes.xml', category: 'resource', description: 'Material 3 compatible application theme.', code: `<?xml version="1.0" encoding="utf-8"?>
<resources><style name="Theme.ShakeFlashlight" parent="android:style/Theme.Material.NoActionBar"><item name="android:windowLightStatusBar">false</item><item name="android:statusBarColor">@android:color/transparent</item><item name="android:navigationBarColor">@android:color/black</item></style></resources>` },
  { path: 'app/src/main/res/xml/backup_rules.xml', name: 'backup_rules.xml', category: 'resource', description: 'Android backup rules.', code: `<?xml version="1.0" encoding="utf-8"?>
<full-backup-content><include domain="sharedpref" path="." /></full-backup-content>` },
  { path: 'app/src/main/res/xml/data_extraction_rules.xml', name: 'data_extraction_rules.xml', category: 'resource', description: 'Android 12+ data extraction rules.', code: `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules><cloud-backup><include domain="sharedpref" path="." /></cloud-backup><device-transfer><include domain="sharedpref" path="." /></device-transfer></data-extraction-rules>` },
  { path: 'app/proguard-rules.pro', name: 'proguard-rules.pro', category: 'gradle', description: 'Release shrinker rules placeholder.', code: '# Add project-specific rules when minification is enabled.' },
  { path: 'app/src/main/res/drawable/ic_launcher.xml', name: 'ic_launcher.xml', category: 'resource', description: 'Temporary vector launcher icon.', code: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108"><path android:fillColor="#0C0D0E" android:pathData="M0,0h108v108h-108z"/><path android:fillColor="#FBBF24" android:pathData="M59,8L25,57h24l-2,43l36,-52h-25z"/></vector>` },
  { path: 'app/src/main/res/drawable/ic_flashlight_notif.xml', name: 'ic_flashlight_notif.xml', category: 'resource', description: 'Notification icon.', code: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24"><path android:fillColor="#FFFFFF" android:pathData="M7,2v11h3v9l7,-12h-4l3,-8z"/></vector>` },
  { path: 'app/src/main/res/drawable/ic_toggle.xml', name: 'ic_toggle.xml', category: 'resource', description: 'Toggle icon.', code: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24"><path android:fillColor="#FFFFFF" android:pathData="M17,7H7c-2.76,0 -5,2.24 -5,5s2.24,5 5,5h10c2.76,0 5,-2.24 5,-5s-2.24,-5 -5,-5zM17,15c-1.66,0 -3,-1.34 -3,-3s1.34,-3 3,-3 3,1.34 3,3 -1.34,3 -3,3z"/></vector>` },
  { path: 'app/src/main/res/drawable/ic_stop.xml', name: 'ic_stop.xml', category: 'resource', description: 'Stop icon.', code: `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android" android:width="24dp" android:height="24dp" android:viewportWidth="24" android:viewportHeight="24"><path android:fillColor="#FFFFFF" android:pathData="M6,6h12v12H6z"/></vector>` },
  { path: 'app/src/main/java/com/flashlight/shake/ui/theme/Theme.kt', name: 'Theme.kt', category: 'kotlin', description: 'Compose Material 3 color theme.', code: `package com.flashlight.shake.ui.theme

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
fun ShakeFlashlightTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = EonMirthDarkScheme, content = content)
}` },
  { path: 'app/src/main/java/com/flashlight/shake/receiver/BootCompletedReceiver.kt', name: 'BootCompletedReceiver.kt', category: 'kotlin', description: 'Restarts the service only when the user had enabled it.', code: `package com.flashlight.shake.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat
import com.flashlight.shake.service.ShakeFlashlightService

class BootCompletedReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return
        val prefs = context.getSharedPreferences(ShakeFlashlightService.PREFS_NAME, Context.MODE_PRIVATE)
        if (prefs.getBoolean("service_enabled", false)) {
            ContextCompat.startForegroundService(context, Intent(context, ShakeFlashlightService::class.java).apply { action = ShakeFlashlightService.ACTION_START })
        }
    }
}` }
];
