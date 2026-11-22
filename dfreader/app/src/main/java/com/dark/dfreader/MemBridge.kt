package com.dark.dfreader

object MemBridge {

 init {
 System.loadLibrary("mem")
 }

 external fun attach(pid: Int): Boolean
 external fun detach(pid: Int): Boolean

 external fun readMem(pid: Int, addr: Long, size: Int): ByteArray?
 external fun writeMem(pid: Int, addr: Long, data: ByteArray): Boolean

 external fun readInt(pid: Int, addr: Long): Int
 external fun readFloat(pid: Int, addr: Long): Float

 external fun writeInt(pid: Int, addr: Long, value: Int): Boolean
 external fun writeFloat(pid: Int, addr: Long, value: Float): Boolean

 external fun scanInt(pid: Int, value: Int): LongArray
 external fun scanFloat(pid: Int, value: Float): LongArray

 external fun refineInt(pid: Int, addrs: LongArray, value: Int): LongArray
 external fun refineFloat(pid: Int, addrs: LongArray, value: Float): LongArray
}