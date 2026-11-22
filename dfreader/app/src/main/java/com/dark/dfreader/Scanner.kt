package com.dark.dfreader

object Scanner {

 enum class Type { INT32, FLOAT }

 private var candidates: LongArray = LongArray(0)
 private var type: Type = Type.INT32
 private var lastValue: String = ""

 fun reset() {
 candidates = LongArray(0)
 lastValue = ""
 }

 fun count(): Int = candidates.size
 fun first(): Long = candidates.firstOrNull() ?: 0L
 fun all(): LongArray = candidates
 fun currentType(): Type = type
 fun lastValue(): String = lastValue

 fun scanInt(pid: Int, value: Int): Int {
 type = Type.INT32
 lastValue = value.toString()
 candidates = MemBridge.scanInt(pid, value)
 return candidates.size
 }

 fun scanFloat(pid: Int, value: Float): Int {
 type = Type.FLOAT
 lastValue = value.toString()
 candidates = MemBridge.scanFloat(pid, value)
 return candidates.size
 }

 fun refineInt(pid: Int, value: Int): Int {
 if (candidates.isEmpty()) return 0
 lastValue = value.toString()
 candidates = MemBridge.refineInt(pid, candidates, value)
 return candidates.size
 }

 fun refineFloat(pid: Int, value: Float): Int {
 if (candidates.isEmpty()) return 0
 lastValue = value.toString()
 candidates = MemBridge.refineFloat(pid, candidates, value)
 return candidates.size
 }

 fun readCurrent(pid: Int, addr: Long): String {
 return when (type) {
 Type.INT32 -> MemBridge.readInt(pid, addr).toString()
 Type.FLOAT -> MemBridge.readFloat(pid, addr).toString()
 }
 }

 fun writeCurrent(pid: Int, addr: Long, text: String): Boolean {
 return when (type) {
 Type.INT32 -> {
 val v = text.toIntOrNull() ?: return false
 MemBridge.writeInt(pid, addr, v)
 }
 Type.FLOAT -> {
 val v = text.toFloatOrNull() ?: return false
 MemBridge.writeFloat(pid, addr, v)
 }
 }
 }
}
