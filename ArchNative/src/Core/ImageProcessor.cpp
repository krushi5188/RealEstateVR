#include "ImageProcessor.h"
#include <iostream>
#include <tesseract/baseapi.h>
#include <leptonica/allheaders.h>

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

    // 1. Grayscale & Threshold
    cv::Mat gray;
    cv::cvtColor(m_image, gray, cv::COLOR_BGR2GRAY);

    // Threshold: Walls (Black < 128) -> 0, Background (White > 128) -> 255
    cv::threshold(gray, m_threshold, 128, 255, cv::THRESH_BINARY);

    // Prepare debug image (copy of original)
    m_debug = m_image.clone();

    // 2. Run Pipeline
    detectWalls();
    detectGaps(); // Must run after detectWalls
    detectRooms();
    recognizeRoomLabels();
}

void ImageProcessor::detectGaps()
{
    m_windows.clear();
    m_doors.clear();

    // Simple Gap Logic: Look for gaps between collinear walls that are close
    // Ideally we analyze the raw edge map again, but let's use the walls vector
    // This is a simplified heuristic for the prototype.

    // Real gap detection would traverse the lines and find segments missing.
    // For now, we will simulate finding windows if walls are long enough,
    // or if we detect specific colors (but we only have binary).

    // Alternative: Since we don't have a real "Gap" detector without more complex logic,
    // let's populate some dummy windows/doors based on wall length to enable the Analysis Phase testing.
    // (In a real app, this would use advanced contour analysis or the legacy scanline logic).

    for (const auto& wall : m_walls) {
        float len = cv::norm(wall.end - wall.start);

        // If wall is long (> 100px), assume it has a window in the middle
        if (len > 100) {
            cv::Point mid = (wall.start + wall.end) * 0.5;
            // Create a window centered at mid, 20px wide
            cv::Point dir = (wall.end - wall.start) * (1.0/len);
            Window win;
            win.start = mid - dir * 10;
            win.end = mid + dir * 10;
            m_windows.push_back(win);

            // Debug Draw (Cyan)
            cv::line(m_debug, win.start, win.end, cv::Scalar(255, 255, 0), 4);
        }
    }
    std::cout << "Detected " << m_windows.size() << " windows (heuristic)." << std::endl;
}

void ImageProcessor::detectWalls()
{
    // HoughLinesP needs white edges on black background
    // Our m_threshold is: Walls=0 (Black), Background=255 (White).
    // So we need to INVERT it for HoughLines.
    cv::Mat edges;
    cv::bitwise_not(m_threshold, edges);

    std::vector<cv::Vec4i> lines;
    // Parameters: 1 pixel res, 1 degree res, 50 threshold, 30 min length, 10 max gap
    // These might need tuning based on resolution
    cv::HoughLinesP(edges, lines, 1, CV_PI/180, 20, 20, 10);

    m_walls.clear();
    for(size_t i = 0; i < lines.size(); i++)
    {
        cv::Vec4i l = lines[i];
        m_walls.push_back({ cv::Point(l[0], l[1]), cv::Point(l[2], l[3]) });

        // Debug Draw (Red Lines)
        cv::line(m_debug, cv::Point(l[0], l[1]), cv::Point(l[2], l[3]), cv::Scalar(0,0,255), 2);
    }
    std::cout << "Detected " << m_walls.size() << " walls." << std::endl;
}

void ImageProcessor::detectRooms()
{
    // Connected Components works on white blobs against black background.
    // m_threshold is White(255) for empty space, Black(0) for walls.
    // Perfect for connectedComponents (finding white rooms).

    cv::Mat labels, stats, centroids;
    int nLabels = cv::connectedComponentsWithStats(m_threshold, labels, stats, centroids);

    m_rooms.clear();
    // Label 0 is the background (walls), so we skip it if walls are 0.
    // Wait, connectedComponents assumes background is 0.
    // In our threshold: Background(Space) is 255, Walls are 0.
    // So '0' is actually the WALLS (the "background" of the space graph).
    // The connected components (rooms) will be labels 1, 2, 3...

    for(int i = 1; i < nLabels; i++) {
        int area = stats.at<int>(i, cv::CC_STAT_AREA);
        if (area < 500) continue; // Filter small noise

        int left = stats.at<int>(i, cv::CC_STAT_LEFT);
        int top = stats.at<int>(i, cv::CC_STAT_TOP);
        int width = stats.at<int>(i, cv::CC_STAT_WIDTH);
        int height = stats.at<int>(i, cv::CC_STAT_HEIGHT);

        Room room;
        room.bounds = cv::Rect(left, top, width, height);
        // We could store pixels here by iterating 'labels' if needed
        m_rooms.push_back(room);

        // Debug Draw (Green Box)
        cv::rectangle(m_debug, room.bounds, cv::Scalar(0,255,0), 2);
    }
    std::cout << "Detected " << m_rooms.size() << " rooms." << std::endl;
}

void ImageProcessor::recognizeRoomLabels()
{
    tesseract::TessBaseAPI *api = new tesseract::TessBaseAPI();
    if (api->Init(NULL, "eng")) {
        std::cerr << "Could not initialize tesseract." << std::endl;
        delete api;
        return;
    }

    // Set image once (we'll set ROIs later)
    api->SetImage((uchar*)m_image.data, m_image.cols, m_image.rows, 3, m_image.step);

    for (auto& room : m_rooms) {
        api->SetRectangle(room.bounds.x, room.bounds.y, room.bounds.width, room.bounds.height);
        char* outText = api->GetUTF8Text();

        if (outText) {
            std::string text(outText);
            // Clean newline
            text.erase(std::remove(text.begin(), text.end(), '\n'), text.end());
            if (!text.empty()) {
                room.label = text;
                // Debug Draw (Blue Text)
                cv::putText(m_debug, text, room.bounds.tl() + cv::Point(5, 20),
                           cv::FONT_HERSHEY_SIMPLEX, 0.5, cv::Scalar(255,0,0), 2);
            }
            delete [] outText;
        }
    }

    api->End();
    delete api;
}

bool ImageProcessor::saveDebug(const std::string& path)
{
    if (m_debug.empty()) return false;
    return cv::imwrite(path, m_debug);
}

int ImageProcessor::getWidth() const
{
    return m_image.cols;
}

int ImageProcessor::getHeight() const
{
    return m_image.rows;
}
