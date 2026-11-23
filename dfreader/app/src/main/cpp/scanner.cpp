#include "scanner.h"

#include <cstring>
#include <algorithm>
#include <android/log.h>

#define LOG_TAG "dfscan"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)

namespace dfmem {

size_t valueSize(ValueType type) {
 switch (type) {
 case ValueType::INT32: return 4;
 case ValueType::FLOAT: return 4;
 case ValueType::INT64: return 8;
 case ValueType::DOUBLE: return 8;
 }
 return 4;
}

static bool skipRegion(const MapRegion& r) {
 if (!r.readable) return true;
 if (r.path == "[vvar]" || r.path == "[vdso]" || r.path == "[vsyscall]") return true;
 if (r.path.rfind("/dev/", 0) == 0) return true;
 if (r.path.rfind("/memfd:", 0) == 0) return true;
 return false;
}

std::vector<uint64_t> scanValue(int pid, const void* value, ValueType type) {
 std::vector<uint64_t> results;

 auto regions = readMaps(pid);
 const size_t vsize = valueSize(type);
 const size_t CHUNK = 1u << 20;

 std::vector<uint8_t> buf(CHUNK);

 for (const auto& r: regions) {
 if (skipRegion(r)) continue;

 uint64_t addr = r.start;
 while (addr < r.end) {
 size_t toRead = static_cast<size_t>(
 std::min<uint64_t>(CHUNK, r.end - addr));

 ssize_t n = readMem(pid, addr, buf.data(), toRead);
 if (n > 0) {
 size_t limit = static_cast<size_t>(n);
 for (size_t i = 0; i + vsize <= limit; i++) {
 if (memcmp(buf.data() + i, value, vsize) == 0) {
 results.push_back(addr + i);
 }
 }
 }
 addr += toRead;
 }
 }

 LOGI("scan done, %zu hits", results.size());
 return results;
}

std::vector<uint64_t> refineValue(int pid,
 const std::vector<uint64_t>& addrs,
 const void* value,
 ValueType type) {
 std::vector<uint64_t> out;

 const size_t vsize = valueSize(type);
 std::vector<uint8_t> buf(vsize);

 for (uint64_t a: addrs) {
 ssize_t n = readMem(pid, a, buf.data(), vsize);
 if (n == static_cast<ssize_t>(vsize) &&
 memcmp(buf.data(), value, vsize) == 0) {
 out.push_back(a);
 }
 }
 return out;
}

}