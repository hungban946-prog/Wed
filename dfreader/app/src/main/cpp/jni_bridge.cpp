#include <jni.h>
#include <cstring>
#include <vector>

#include "mem.h"
#include "scanner.h"

using namespace dfmem;

extern "C" {

JNIEXPORT jboolean JNICALL
Java_com_dark_dfreader_MemBridge_attach(JNIEnv* env, jobject thiz, jint pid) {
 (void) env; (void) thiz;
 return attach(static_cast<int>(pid)) ? JNI_TRUE: JNI_FALSE;
}

JNIEXPORT jboolean JNICALL
Java_com_dark_dfreader_MemBridge_detach(JNIEnv* env, jobject thiz, jint pid) {
 (void) env; (void) thiz;
 return detach(static_cast<int>(pid)) ? JNI_TRUE: JNI_FALSE;
}

JNIEXPORT jbyteArray JNICALL
Java_com_dark_dfreader_MemBridge_readMem(JNIEnv* env, jobject thiz,
 jint pid, jlong addr, jint size) {
 (void) thiz;
 if (size <= 0) return nullptr;

 std::vector<uint8_t> buf(static_cast<size_t>(size));
 ssize_t n = readMem(static_cast<int>(pid),
 static_cast<uint64_t>(addr),
 buf.data(),
 static_cast<size_t>(size));
 if (n <= 0) return nullptr;

 jbyteArray arr = env->NewByteArray(static_cast<jsize>(n));
 if (arr == nullptr) return nullptr;

 env->SetByteArrayRegion(arr, 0, static_cast<jsize>(n),
 reinterpret_cast<const jbyte*>(buf.data()));
 return arr;
}

JNIEXPORT jboolean JNICALL
Java_com_dark_dfreader_MemBridge_writeMem(JNIEnv* env, jobject thiz,
 jint pid, jlong addr, jbyteArray data) {
 (void) thiz;
 if (data == nullptr) return JNI_FALSE;

 jsize len = env->GetArrayLength(data);
 std::vector<uint8_t> buf(static_cast<size_t>(len));
 env->GetByteArrayRegion(data, 0, len,
 reinterpret_cast<jbyte*>(buf.data()));

 bool ok = writeMem(static_cast<int>(pid),
 static_cast<uint64_t>(addr),
 buf.data(),
 static_cast<size_t>(len));
 return ok ? JNI_TRUE: JNI_FALSE;
}

JNIEXPORT jint JNICALL
Java_com_dark_dfreader_MemBridge_readInt(JNIEnv* env, jobject thiz,
 jint pid, jlong addr) {
 (void) env; (void) thiz;
 int32_t v = 0;
 readMem(static_cast<int>(pid), static_cast<uint64_t>(addr), &v, sizeof(v));
 return static_cast<jint>(v);
}

JNIEXPORT jfloat JNICALL
Java_com_dark_dfreader_MemBridge_readFloat(JNIEnv* env, jobject thiz,
 jint pid, jlong addr) {
 (void) env; (void) thiz;
 float v = 0.0f;
 readMem(static_cast<int>(pid), static_cast<uint64_t>(addr), &v, sizeof(v));
 return static_cast<jfloat>(v);
}

JNIEXPORT jboolean JNICALL
Java_com_dark_dfreader_MemBridge_writeInt(JNIEnv* env, jobject thiz,
 jint pid, jlong addr, jint value) {
 (void) env; (void) thiz;
 int32_t v = static_cast<int32_t>(value);
 return writeMem(static_cast<int>(pid), static_cast<uint64_t>(addr),
 &v, sizeof(v)) ? JNI_TRUE: JNI_FALSE;
}

JNIEXPORT jboolean JNICALL
Java_com_dark_dfreader_MemBridge_writeFloat(JNIEnv* env, jobject thiz,
 jint pid, jlong addr, jfloat value) {
 (void) env; (void) thiz;
 float v = static_cast<float>(value);
 return writeMem(static_cast<int>(pid), static_cast<uint64_t>(addr),
 &v, sizeof(v)) ? JNI_TRUE: JNI_FALSE;
}

JNIEXPORT jlongArray JNICALL
Java_com_dark_dfreader_MemBridge_scanInt(JNIEnv* env, jobject thiz,
 jint pid, jint value) {
 (void) thiz;
 int32_t v = static_cast<int32_t>(value);
 auto res = scanValue(static_cast<int>(pid), &v, ValueType::INT32);

 jlongArray arr = env->NewLongArray(static_cast<jsize>(res.size()));
 if (arr == nullptr) return nullptr;

 env->SetLongArrayRegion(arr, 0, static_cast<jsize>(res.size()),
 reinterpret_cast<const jlong*>(res.data()));
 return arr;
}

JNIEXPORT jlongArray JNICALL
Java_com_dark_dfreader_MemBridge_scanFloat(JNIEnv* env, jobject thiz,
 jint pid, jfloat value) {
 (void) thiz;
 float v = static_cast<float>(value);
 auto res = scanValue(static_cast<int>(pid), &v, ValueType::FLOAT);

 jlongArray arr = env->NewLongArray(static_cast<jsize>(res.size()));
 if (arr == nullptr) return nullptr;

 env->SetLongArrayRegion(arr, 0, static_cast<jsize>(res.size()),
 reinterpret_cast<const jlong*>(res.data()));
 return arr;
}

JNIEXPORT jlongArray JNICALL
Java_com_dark_dfreader_MemBridge_refineInt(JNIEnv* env, jobject thiz,
 jint pid, jlongArray addrs, jint value) {
 (void) thiz;
 jsize len = env->GetArrayLength(addrs);
 std::vector<jlong> tmp(static_cast<size_t>(len));
 env->GetLongArrayRegion(addrs, 0, len, tmp.data());

 std::vector<uint64_t> in(tmp.begin(), tmp.end());
 int32_t v = static_cast<int32_t>(value);
 auto res = refineValue(static_cast<int>(pid), in, &v, ValueType::INT32);

 jlongArray arr = env->NewLongArray(static_cast<jsize>(res.size()));
 if (arr == nullptr) return nullptr;

 env->SetLongArrayRegion(arr, 0, static_cast<jsize>(res.size()),
 reinterpret_cast<const jlong*>(res.data()));
 return arr;
}

JNIEXPORT jlongArray JNICALL
Java_com_dark_dfreader_MemBridge_refineFloat(JNIEnv* env, jobject thiz,
 jint pid, jlongArray addrs, jfloat value) {
 (void) thiz;
 jsize len = env->GetArrayLength(addrs);
 std::vector<jlong> tmp(static_cast<size_t>(len));
 env->GetLongArrayRegion(addrs, 0, len, tmp.data());

 std::vector<uint64_t> in(tmp.begin(), tmp.end());
 float v = static_cast<float>(value);
 auto res = refineValue(static_cast<int>(pid), in, &v, ValueType::FLOAT);

 jlongArray arr = env->NewLongArray(static_cast<jsize>(res.size()));
 if (arr == nullptr) return nullptr;

 env->SetLongArrayRegion(arr, 0, static_cast<jsize>(res.size()),
 reinterpret_cast<const jlong*>(res.data()));
 return arr;
}

}
