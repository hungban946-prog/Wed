package com.dark.dfreader

import java.io.File

object GameFinder {

 data class ProcInfo(val pid: Int, val name: String, val cmdline: String)

 fun findPid(name: String): Int {
 val target = name.trim()
 if (target.isEmpty()) return -1

 for (p in listProcesses()) {
 if (p.name == target) return p.pid
 }
 for (p in listProcesses()) {
 if (p.name.endsWith("/$target")) return p.pid
 }
 for (p in listProcesses()) {
 if (p.name.contains(target, ignoreCase = true)) return p.pid
 }
 return -1
 }

 fun listProcesses(): List<ProcInfo> {
 val out = mutableListOf<ProcInfo>()
 val procDir = File("/proc")
 val entries = procDir.listFiles() ?: return out

 for (entry in entries) {
 if (!entry.isDirectory) continue
 val pid = entry.name.toIntOrNull() ?: continue

 val cmdline = readCmdline(entry) ?: continue
 if (cmdline.isBlank()) continue

 val name = cmdline.substringBefore(' ').substringAfterLast('/')
 out.add(ProcInfo(pid, name, cmdline))
 }
 return out.sortedBy { it.name }
 }

 fun findByNameContains(fragment: String): List<ProcInfo> {
 val f = fragment.trim()
 if (f.isEmpty()) return emptyList()
 return listProcesses().filter {
 it.name.contains(f, ignoreCase = true) ||
 it.cmdline.contains(f, ignoreCase = true)
 }
 }

 private fun readCmdline(dir: File): String? {
 return try {
 val bytes = File(dir, "cmdline").readBytes()
 if (bytes.isEmpty()) return null
 val text = String(bytes, Charsets.UTF_8)
 text.split('\u0000')
.filter { it.isNotBlank() }
.joinToString(" ")
.trim()
.ifBlank { null }
 } catch (e: Exception) {
 null
 }
 }
}