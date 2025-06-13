cmake_minimum_required(VERSION 3.14)
project(FileUploader VERSION 1.0)

# Set C++ standard
set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Include FetchContent module
include(FetchContent)

# Fetch curl library
FetchContent_Declare(
    curl
    GIT_REPOSITORY https://github.com/curl/curl.git
    GIT_TAG        curl-7_86_0
)

# Configure curl options
set(BUILD_SHARED_LIBS OFF CACHE BOOL "" FORCE)
set(HTTP_ONLY OFF CACHE BOOL "" FORCE) # Allow HTTPS and other protocols
set(BUILD_TESTING OFF CACHE BOOL "" FORCE)
set(BUILD_CURL_EXE OFF CACHE BOOL "" FORCE)
set(CURL_DISABLE_LDAP ON CACHE BOOL "" FORCE)
set(CURL_DISABLE_LDAPS ON CACHE BOOL "" FORCE)

# Make curl available
FetchContent_MakeAvailable(curl)

# Add executable
add_executable(file_uploader src/main.cpp)

# Link with curl
target_link_libraries(file_uploader PRIVATE libcurl)

# Include curl headers
target_include_directories(file_uploader PRIVATE ${curl_SOURCE_DIR}/include)
