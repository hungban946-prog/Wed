cmake_minimum_required(VERSION 3.22.1)

project(dfreader CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

add_library(mem SHARED
 mem.cpp
 scanner.cpp
 jni_bridge.cpp)

find_library(log-lib log)
target_link_libraries(mem ${log-lib})