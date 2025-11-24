#ifndef IMAGEPROCESSOR_H
#define IMAGEPROCESSOR_H

#include <string>
#include <vector>
#include <opencv2/opencv.hpp>

class ImageProcessor
{
public:
    ImageProcessor();
    ~ImageProcessor();

    bool load(const std::string& path);
    void process(); // Basic thresholding for Phase 2N.1
    bool saveDebug(const std::string& path);

    // Getters for verification
    int getWidth() const;
    int getHeight() const;

private:
    cv::Mat m_image;
    cv::Mat m_processed;
};

#endif // IMAGEPROCESSOR_H
