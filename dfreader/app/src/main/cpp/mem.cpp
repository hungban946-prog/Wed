#include "mem.h"

#include <sys/ptrace.h>
#include <sys/uio.h>
#include <sys/wait.h>
#include <fcntl.h>
#include <unistd.h>
#include <cerrno>
#include <cstring>
#include <cstdio>
#include <fstream>
#include <android/log.h>

#define LOG_TAG "dfmem"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

namespace dfmem {

bool attach(int pid) {
 if (ptrace(PTRACE_ATTACH, pid, nullptr, nullptr) != 0) {
 LOGE("PTRACE_ATTACH(%d) failed: %s", pid, strerror(errno));
 return false;
 }
 int status = 0;
 if (waitpid(pid, &status, 0) < 0) {
 LOGE("waitpid(%d) failed: %s", pid, strerror(errno));
 ptrace(PTRACE_DETACH, pid, nullptr, nullptr);
 return false;
 }
 LOGI("attached to %d", pid);
 return true;
}

bool detach(int pid) {
 if (ptrace(PTRACE_DETACH, pid, nullptr, nullptr) != 0) {
 LOGE("PTRACE_DETACH(%d) failed: %s", pid, strerror(errno));
 return false;
 }
 return true;
}

ssize_t readMem(int pid, uint64_t addr, void* buf, size_t size) {
 if (size == 0) return 0;

 struct iovec local;
 local.iov_base = buf;
 local.iov_len = size;

 struct iovec remote;
 remote.iov_base = reinterpret_cast<void*>(addr);
 remote.iov_len = size;

 ssize_t n = process_vm_readv(pid, &local, 1, &remote, 1, 0);
 if (n == static_cast<ssize_t>(size)) return n;

 char path[64];
 snprintf(path, sizeof(path), "/proc/%d/mem", pid);
 int fd = open(path, O_RDONLY);
 if (fd < 0) return n;

 ssize_t r = pread(fd, buf, size, static_cast<off_t>(addr));
 close(fd);
 return r;
}

bool writeMem(int pid, uint64_t addr, const void* buf, size_t size) {
 if (size == 0) return true;

 struct iovec local;
 local.iov_base = const_cast<void*>(buf);
 local.iov_len = size;

 struct iovec remote;
 remote.iov_base = reinterpret_cast<void*>(addr);
 remote.iov_len = size;

 ssize_t n = process_vm_writev(pid, &local, 1, &remote, 1, 0);
 if (n == static_cast<ssize_t>(size)) return true;

 char path[64];
 snprintf(path, sizeof(path), "/proc/%d/mem", pid);
 int fd = open(path, O_RDWR);
 if (fd < 0) return false;

 ssize_t r = pwrite(fd, buf, size, static_cast<off_t>(addr));
 close(fd);
 return r == static_cast<ssize_t>(size);
}

std::vector<MapRegion> readMaps(int pid) {
 std::vector<MapRegion> out;

 char path[64];
 snprintf(path, sizeof(path), "/proc/%d/maps", pid);

 std::ifstream f(path);
 if (!f.is_open()) return out;

 std::string line;
 while (std::getline(f, line)) {
 MapRegion r;
 unsigned long long start = 0;
 unsigned long long end = 0;
 char perms[8] = {0};
 char rest[512] = {0};

 int matched = sscanf(line.c_str(),
 "%llx-%llx %7s %*s %*s %*s %511[^\n]",
 &start, &end, perms, rest);
 if (matched < 3) continue;

 r.start = start;
 r.end = end;
 r.readable = perms[0] == 'r';
 r.writable = perms[1] == 'w';
 r.executable = perms[2] == 'x';

 if (matched >= 4) {
 std::string p(rest);
 size_t s = p.find_first_not_of(" \t");
 if (s != std::string::npos) r.path = p.substr(s);
 }

 out.push_back(r);
 }
 return out;
}

}