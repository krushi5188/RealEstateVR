#ifndef VIRTUALAGENT_H
#define VIRTUALAGENT_H

#include <vector>
#include <opencv2/opencv.hpp>

class VirtualAgent
{
public:
    VirtualAgent();

    void setPath(const std::vector<cv::Point>& path);
    void update(float deltaTime); // Move along path

    cv::Point getPosition() const;
    bool hasReachedTarget() const;

private:
    std::vector<cv::Point> m_path;
    int m_currentIndex;
    cv::Point m_position;
    float m_speed; // pixels per second
};

#endif // VIRTUALAGENT_H
