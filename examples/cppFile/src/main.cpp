#include <iostream>
#include <string>
#include <fstream>
#include <ctime>
#include <curl/curl.h>
#include <iomanip>
#include <cstdio>

// Helper function to get current date as string
std::string getCurrentDate() {
    time_t now = time(0);
    struct tm timeinfo;
    char buffer[80];
    
    localtime_r(&now, &timeinfo);
    strftime(buffer, sizeof(buffer), "%Y-%m-%d", &timeinfo);
    
    return std::string(buffer);
}

// Function to create a test file (for demonstration purposes)
void createLargeTestFile(const std::string& filename, size_t sizeMB) {
    std::cout << "Creating " << sizeMB << "MB test file: " << filename << std::endl;
    
    // Open the file for writing
    FILE* file = fopen(filename.c_str(), "wb");
    if (!file) {
        std::cerr << "Failed to create test file!" << std::endl;
        return;
    }
    
    // Write data in chunks to avoid excessive memory usage
    const size_t chunkSize = 1024 * 1024; // 1MB chunks
    char* buffer = new char[chunkSize];
    
    // Fill buffer with some pattern
    for (size_t i = 0; i < chunkSize; i++) {
        buffer[i] = static_cast<char>(i % 256);
    }
    
    // Write chunks until we reach desired size
    for (size_t i = 0; i < sizeMB; i++) {
        if (fwrite(buffer, 1, chunkSize, file) != chunkSize) {
            std::cerr << "Error writing to file!" << std::endl;
            fclose(file);
            delete[] buffer;
            return;
        }
        
        // Print progress
        if (i % 5 == 0) {
            std::cout << "Written " << i << "MB of " << sizeMB << "MB\r";
            std::cout.flush();
        }
    }
    
    // Write some identifying info at the end of the file
    std::string endInfo = "File created on " + getCurrentDate() + 
                         " from workspace: c:\\Users\\ali.turan\\Desktop\\vibe\\cppFile";
    fwrite(endInfo.c_str(), 1, endInfo.size(), file);
    
    fclose(file);
    delete[] buffer;
    
    std::cout << "\nFinished creating " << sizeMB << "MB test file." << std::endl;
}

// Progress callback function
static int progressCallback(void* clientp, curl_off_t dltotal, curl_off_t dlnow, curl_off_t ultotal, curl_off_t ulnow) {
    if (ultotal > 0) {
        double percentage = (static_cast<double>(ulnow) / static_cast<double>(ultotal)) * 100;
        std::cout << "Upload progress: " << std::fixed << std::setprecision(2) << percentage << "% (" 
                  << ulnow / (1024 * 1024) << "MB / " << ultotal / (1024 * 1024) << "MB)\r";
        std::cout.flush();
    }
    return 0; // Return non-zero to abort the transfer
}

// Callback function for writing response data
static size_t writeCallback(char* ptr, size_t size, size_t nmemb, void* userdata) {
    // For large uploads, avoid printing the entire response which could be large
    static bool headerPrinted = false;
    if (!headerPrinted) {
        std::cout << "\nReceiving response (showing first part only)..." << std::endl;
        headerPrinted = true;
    }
    
    // Only print first chunk of response
    static size_t totalReceived = 0;
    const size_t receivedSize = size * nmemb;
    if (totalReceived < 1024) { // Only show first 1KB of response
        size_t bytesToShow = receivedSize;
        if (totalReceived + receivedSize > 1024) {
            bytesToShow = 1024 - totalReceived;
        }
        std::string data(ptr, bytesToShow);
        std::cout << data;
    } else if (totalReceived == 1024) {
        std::cout << "...(response truncated)..." << std::endl;
    }
    
    totalReceived += receivedSize;
    return receivedSize;
}

#define TEST_URL "http://httpbin.org/post" // For testing

int main() {
    // Initialize curl
    curl_global_init(CURL_GLOBAL_ALL);
    CURL* curl = curl_easy_init();
    
    if (curl) {
        const std::string testFilename = "large_test_file.dat";
        const std::string uploadUrl = TEST_URL; // For testing
        const size_t fileSize = 35; // Size in MB
        
        // Create a large test file - comment this out if you're using a real file
        createLargeTestFile(testFilename, fileSize);
        
        // Open file for reading
        FILE* file = fopen(testFilename.c_str(), "rb");
        if (!file) {
            std::cerr << "Failed to open file for reading!" << std::endl;
            curl_easy_cleanup(curl);
            curl_global_cleanup();
            return 1;
        }
        
        // Get file size
        fseek(file, 0, SEEK_END);
        curl_off_t fileLength = ftell(file);
        fseek(file, 0, SEEK_SET);
        
        // For large files, use multipart form with chunked transfer
        struct curl_httppost* formpost = nullptr;
        struct curl_httppost* lastptr = nullptr;
        
        // Add form fields - date and workspace info
        curl_formadd(&formpost, &lastptr,
                     CURLFORM_COPYNAME, "date",
                     CURLFORM_COPYCONTENTS, getCurrentDate().c_str(),
                     CURLFORM_END);
        
        curl_formadd(&formpost, &lastptr,
                     CURLFORM_COPYNAME, "workspace",
                     CURLFORM_COPYCONTENTS, "simengine",
                     CURLFORM_END);
        
        // Add file to form using file stream instead of in-memory approach
        curl_formadd(&formpost, &lastptr,
                     CURLFORM_COPYNAME, "file",
                     CURLFORM_FILE, testFilename.c_str(),
                     CURLFORM_FILENAME, testFilename.c_str(),
                     CURLFORM_CONTENTTYPE, "application/octet-stream",
                     CURLFORM_END);
        
        // Set curl options
        curl_easy_setopt(curl, CURLOPT_URL, uploadUrl.c_str());
        curl_easy_setopt(curl, CURLOPT_HTTPPOST, formpost);
        
        // Set progress tracking
        curl_easy_setopt(curl, CURLOPT_NOPROGRESS, 0L);
        curl_easy_setopt(curl, CURLOPT_XFERINFOFUNCTION, progressCallback);
        
        // Set response callback
        curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, writeCallback);
        
        // Set timeouts for large files
        curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, 30L); // 30 seconds to connect
        curl_easy_setopt(curl, CURLOPT_TIMEOUT, 0L); // No timeout for transfer (use with caution)
        
        // Set larger buffer size for improved performance
        curl_easy_setopt(curl, CURLOPT_BUFFERSIZE, 256L * 1024L); // 256KB buffer
        
        // Perform the request
        std::cout << "Starting upload of " << fileLength / (1024 * 1024) << "MB to " << uploadUrl << "..." << std::endl;
        CURLcode res = curl_easy_perform(curl);
        
        // Check for errors
        if (res != CURLE_OK) {
            std::cerr << "\ncurl_easy_perform() failed: " << curl_easy_strerror(res) << std::endl;
        } else {
            // Get HTTP response code
            long response_code;
            curl_easy_getinfo(curl, CURLINFO_RESPONSE_CODE, &response_code);
            std::cout << "\nFile uploaded successfully! HTTP response code: " << response_code << std::endl;
            
            // Get upload statistics
            double uploadSpeed;
            curl_easy_getinfo(curl, CURLINFO_SPEED_UPLOAD, &uploadSpeed);
            std::cout << "Average upload speed: " << std::fixed << std::setprecision(2) 
                     << uploadSpeed / 1024 << " KB/s" << std::endl;
        }
        
        // Clean up
        fclose(file);
        curl_formfree(formpost);
        curl_easy_cleanup(curl);
    }
    
    curl_global_cleanup();
    return 0;
}
