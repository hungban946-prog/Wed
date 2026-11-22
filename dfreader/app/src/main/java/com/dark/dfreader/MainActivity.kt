package com.dark.dfreader

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import kotlin.concurrent.thread

class MainActivity: AppCompatActivity() {

 private lateinit var logView: TextView
 private lateinit var procInput: EditText
 private lateinit var valueInput: EditText

 private var pid: Int = -1
 private var attached = false

 override fun onCreate(savedInstanceState: Bundle?) {
 super.onCreate(savedInstanceState)
 setContentView(R.layout.activity_main)

 logView = findViewById(R.id.logView)
 procInput = findViewById(R.id.procInput)
 valueInput = findViewById(R.id.valueInput)

 findViewById<Button>(R.id.btnFind).setOnClickListener { doFind() }
 findViewById<Button>(R.id.btnAttach).setOnClickListener { doAttach() }
 findViewById<Button>(R.id.btnScan).setOnClickListener { doScan() }
 findViewById<Button>(R.id.btnRefine).setOnClickListener { doRefine() }
 findViewById<Button>(R.id.btnWrite).setOnClickListener { doWrite() }
 findViewById<Button>(R.id.btnOverlay).setOnClickListener { doOverlay() }
 findViewById<Button>(R.id.btnClear).setOnClickListener {
 logView.text = ""
 Scanner.reset()
 }
 }

 private fun log(msg: String) {
 runOnUiThread { logView.append("$msg\n") }
 }

 private fun doFind() {
 val name = procInput.text.toString().ifBlank { "com.tencent.tmgp.dfm" }
 thread {
 val found = GameFinder.findPid(name)
 if (found > 0) {
 pid = found
 log("PID của $name = $pid")
 } else {
 log("Không tìm thấy: $name")
 log("Gợi ý gần đúng:")
 GameFinder.findByNameContains(name.take(6))
.take(20)
.forEach { log(" ${it.pid} ${it.name}") }
 }
 }
 }

 private fun doAttach() {
 if (pid <= 0) {
 log("Chưa có PID — bấm Tìm PID trước")
 return
 }
 thread {
 val ok = MemBridge.attach(pid)
 attached = ok
 log(if (ok) "Attach OK vào $pid" else "Attach THẤT BẠI — xem logcat dfmem")
 }
 }

 private fun doScan() {
 if (pid <= 0) { log("Chưa có PID"); return }
 if (!attached) { log("Chưa attach"); return }

 val text = valueInput.text.toString()
 if (text.isBlank()) { log("Nhập giá trị"); return }

 thread {
 log("Đang scan $text...")
 val t0 = System.currentTimeMillis()
 val n = if (text.contains('.')) {
 Scanner.scanFloat(pid, text.toFloat())
 } else {
 Scanner.scanInt(pid, text.toInt())
 }
 val dt = System.currentTimeMillis() - t0
 log("Tìm thấy $n địa chỉ (${dt}ms)")
 Scanner.all().take(10).forEach { log(" @0x${it.toString(16)}") }
 }
 }

 private fun doRefine() {
 if (pid <= 0) { log("Chưa có PID"); return }
 if (Scanner.count() == 0) { log("Chưa scan"); return }

 val text = valueInput.text.toString()
 if (text.isBlank()) { log("Nhập giá trị mới"); return }

 thread {
 val n = if (text.contains('.')) {
 Scanner.refineFloat(pid, text.toFloat())
 } else {
 Scanner.refineInt(pid, text.toInt())
 }
 log("Còn lại $n địa chỉ")
 Scanner.all().take(10).forEach { log(" @0x${it.toString(16)}") }
 }
 }

 private fun doWrite() {
 if (pid <= 0) { log("Chưa có PID"); return }
 val addr = Scanner.first()
 if (addr == 0L) { log("Chưa có địa chỉ"); return }

 val text = valueInput.text.toString()
 if (text.isBlank()) { log("Nhập giá trị để ghi"); return }

 thread {
 val ok = Scanner.writeCurrent(pid, addr, text)
 log(if (ok) "Ghi OK vào 0x${addr.toString(16)}" else "Ghi THẤT BẠI")
 }
 }

 private fun doOverlay() {
 if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M &&
 !Settings.canDrawOverlays(this)) {
 startActivity(
 Intent(
 Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
 Uri.parse("package:$packageName")
 )
 )
 return
 }

 if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
 ContextCompat.checkSelfPermission(
 this, Manifest.permission.POST_NOTIFICATIONS
 ) != PackageManager.PERMISSION_GRANTED) {
 ActivityCompat.requestPermissions(
 this,
 arrayOf(Manifest.permission.POST_NOTIFICATIONS),
 REQ_NOTIF
 )
 return
 }

 startOverlay()
 }

 private fun startOverlay() {
 val addr = Scanner.first()
 if (addr == 0L) { log("Chưa có địa chỉ để hiện"); return }

 val i = Intent(this, OverlayService::class.java)
 i.putExtra(OverlayService.EXTRA_PID, pid)
 i.putExtra(OverlayService.EXTRA_ADDR, addr)

 if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
 startForegroundService(i)
 } else {
 startService(i)
 }
 log("Overlay đã bật cho 0x${addr.toString(16)}")
 }

 override fun onRequestPermissionsResult(
 requestCode: Int,
 permissions: Array<out String>,
 grantResults: IntArray
 ) {
 super.onRequestPermissionsResult(requestCode, permissions, grantResults)
 if (requestCode == REQ_NOTIF) {
 startOverlay()
 }
 }

 companion object {
 private const val REQ_NOTIF = 2001
 }
}