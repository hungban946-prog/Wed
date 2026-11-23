#ifndef DFREADER_SCANNER_H
#define DFREADER_SCANNER_H

#include <cstdint>
#include <cstddef>
#include <vector>
#include "mem.h"

namespace dfmem {

enum class ValueType {
 INT32,
 FLOAT,
 INT64,
 DOUBLE
};

size_t valueSize(ValueType type);

std::vector<uint64_t> scanValue(int pid, const void* value, ValueType type);

std::vector<uint64_t> refineValue(int pid,
 const std::vector<uint64_t>& addrs,
 const void* value,
 ValueType type);

}

#endif