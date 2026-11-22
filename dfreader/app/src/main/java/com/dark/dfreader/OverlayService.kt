package com.dark.dfreader

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.LinearLayout
import android.widget.TextView

class OverlayService: Service() {

 private lateinit var wm: WindowManager
 private lateinit var root: LinearLayout
 private lateinit var valueView: TextView
 private lateinit var addrView: TextView

 private val handler = Handler(Looper.getMainLooper())

 private var pid: Int = -1
 private var addr: Long = 0L
 private var running = false

 private val tick = object: Runnable {
 override fun run() {
 if (!running) return
 if (pid > 0 && addr != 0L) {
 val v = Scanner.readCurrent(pid, addr)
 valueView.text = v
 addrView.text = "0x${addr.toString(16)}"
 }
 handler.postDelayed(this, 300)
 }
 }

 override fun onBind(intent: Intent?): IBinder? = null

 override fun onCreate() {
 super.onCreate()
 startForegroundSafe()
 }

 override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
 pid = intent?.getIntExtra(EXTRA_PID, -1) ?: -1
 addr = intent?.getLongExtra(EXTRA_ADDR, 0L) ?: 0L

 if (!this::wm.isInitialized) {
 wm = getSystemService(Context.WINDOW_SERVICE) as WindowManager
 buildView()
 handler.post(tick)
 running = true
 } else {
 valueView.text = "…"
 }

 return START_STICKY
 }

 private fun buildView() {
 root = LinearLayout(this).apply {
 orientation = LinearLayout.VERTICAL
 setBackgroundColor(Color.parseColor("#CC000000"))
 setPadding(28, 20, 28, 20)
 }

 valueView = TextView(this).apply {
 setTextColor(Color.WHITE)
 textSize = 22f
 text = "…"
 }

 addrView = TextView(this).apply {
 setTextColor(Color.parseColor("#AAAAAA"))
 textSize = 11f
 text = "0x0"
 }

 root.addView(valueView)
 root.addView(addrView)

 val params = WindowManager.LayoutParams(
 WindowManager.LayoutParams.WRAP_CONTENT,
 WindowManager.LayoutParams.WRAP_CONTENT,
 if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
 WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
 else
 WindowManager.LayoutParams.TYPE_PHONE,
 WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
 PixelFormat.TRANSLUCENT
 ).apply {
 gravity = Gravity.TOP or Gravity.START
 x = 40
 y = 240
 }

 root.setOnTouchListener(object: View.OnTouchListener {
 private var startX = 0
 private var startY = 0
 private var touchX = 0f
 private var touchY = 0f

 override fun onTouch(v: View, e: MotionEvent): Boolean {
 when (e.action) {
 MotionEvent.ACTION_DOWN -> {
 startX = params.x
 startY = params.y
 touchX = e.rawX
 touchY = e.rawY
 return true
 }
 MotionEvent.ACTION_MOVE -> {
 params.x = startX + (e.rawX - touchX).toInt()
 params.y = startY + (e.rawY - touchY).toInt()
 wm.updateViewLayout(root, params)
 return true
 }
 }
 return false
 }
 })

 wm.addView(root, params)
 }

 private fun startForegroundSafe() {
 if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
 val ch = NotificationChannel(
 CHANNEL_ID,
 "DFReader",
 NotificationManager.IMPORTANCE_LOW
 )
 val nm = getSystemService(NotificationManager::class.java)
 nm.createNotificationChannel(ch)

 val n = Notification.Builder(this, CHANNEL_ID)
.setContentTitle("DFReader")
.setContentText("Đang đọc bộ nhớ")
.setSmallIcon(android.R.drawable.ic_menu_view)
.build()

 startForeground(NOTIF_ID, n)
 }
 }

 override fun onDestroy() {
 super.onDestroy()
 running = false
 handler.removeCallbacks(tick)
 if (this::wm.isInitialized && this::root.isInitialized) {
 try {
 wm.removeView(root)
 } catch (e: Exception) {
 // view đã bị gỡ
 }
 }
 }

 companion object {
 const val EXTRA_PID = "pid"
 const val EXTRA_ADDR = "addr"
 private const val CHANNEL_ID = "dfreader_overlay"
 private const val NOTIF_ID = 1001
 }
}