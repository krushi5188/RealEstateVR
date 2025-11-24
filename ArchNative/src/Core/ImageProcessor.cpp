#include "ImageProcessor.h"
#include <iostream>

ImageProcessor::ImageProcessor()
{
}

ImageProcessor::~ImageProcessor()
{
}

bool ImageProcessor::load(const std::string& path)
{
    m_image = cv::imread(path);
    if (m_image.empty()) {
        std::cerr << "Failed to load image: " << path << std::endl;
        return false;
    }
    return true;
}

void ImageProcessor::process()
{
    if (m_image.empty()) return;

    // Phase 2N.1 Logic: Basic Thresholding (Extract Walls)
    // Convert to grayscale
    cv::Mat gray;
    cv::cvtColor(m_image, gray, cv::COLOR_BGR2GRAY);

    // Apply threshold (mimicking extractWallsFromBitmap where < 128 is wall)
    // We invert it so walls (black) become white (255) for contour detection later
    // In extractWallsFromBitmap: avg > THRESHOLD ? 255 (White) : 0 (Black).
    // So walls are Black (0).
    // Let's stick to the legacy logic: Walls are 0, Background is 255.

    // cv::threshold(src, dst, thresh, maxval, type)
    // THRESH_BINARY: if src(x,y) > thresh ? maxval : 0
    // So if pixel > 128 (Whiteish) -> 255 (White)
    // If pixel <= 128 (Blackish) -> 0 (Black)
    cv::threshold(gray, m_processed, 128, 255, cv::THRESH_BINARY);
}

bool ImageProcessor::saveDebug(const std::string& path)
{
    if (m_processed.empty()) return false;
    return cv::imwrite(path, m_processed);
}

int ImageProcessor::getWidth() const
{
    return m_image.cols;
}

int ImageProcessor::getHeight() const
{
    return m_image.rows;
}
