#ifndef IMAGEPROCESSOR_H
#define IMAGEPROCESSOR_H

#include <string>
#include <vector>
#include <opencv2/opencv.hpp>

struct Wall {
    cv::Point start;
    cv::Point end;
    // We can add thickness later
};

struct Room {
    cv::Rect bounds;
    std::string label;
    std::vector<cv::Point> pixels; // For precise area
    float getArea() const { return bounds.width * bounds.height; } // Approx
};

struct Window {
    cv::Point start;
    cv::Point end;
    float width() const { return cv::norm(end - start); }
};

struct Door {
    cv::Point start;
    cv::Point end;
    float width() const { return cv::norm(end - start); }
};

class ImageProcessor
{
public:
    ImageProcessor();
    ~ImageProcessor();

    bool load(const std::string& path);
    void process();

    // Phase 2N.2 / 2N.3
    void detectWalls();
    void detectRooms();
    void detectGaps(); // Windows/Doors
    void recognizeRoomLabels();

    bool saveDebug(const std::string& path);

    // Getters
    int getWidth() const;
    int getHeight() const;
    const std::vector<Wall>& getWalls() const { return m_walls; }
    const std::vector<Room>& getRooms() const { return m_rooms; }
    const std::vector<Window>& getWindows() const { return m_windows; }
    const std::vector<Door>& getDoors() const { return m_doors; }

private:
    cv::Mat m_image;      // Original loaded image
    cv::Mat m_threshold;  // Binary (Walls=0, Empty=255) for processing
    cv::Mat m_debug;      // Visualization output

    std::vector<Wall> m_walls;
    std::vector<Room> m_rooms;
    std::vector<Window> m_windows;
    std::vector<Door> m_doors;
};

#endif // IMAGEPROCESSOR_H
