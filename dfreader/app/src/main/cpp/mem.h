#ifndef DFREADER_MEM_H
#define DFREADER_MEM_H

#include <cstdint>
#include <cstddef>
#include <vector>
#include <string>
#include <sys/types.h>

namespace dfmem {

struct MapRegion {
 uint64_t start = 0;
 uint64_t end = 0;
 bool readable = false;
 bool writable = false;
 bool executable = false;
 std::string path;
};

bool attach(int pid);
bool detach(int pid);

ssize_t readMem(int pid, uint64_t addr, void* buf, size_t size);
bool writeMem(int pid, uint64_t addr, const void* buf, size_t size);

std::vector<MapRegion> readMaps(int pid);

}

#endif