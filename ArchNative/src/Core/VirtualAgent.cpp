#include "VirtualAgent.h"
#include <cmath>

VirtualAgent::VirtualAgent() : m_currentIndex(0), m_speed(50.0f), m_position(0,0)
{
}

void VirtualAgent::setPath(const std::vector<cv::Point>& path)
{
    m_path = path;
    m_currentIndex = 0;
    if (!m_path.empty()) {
        m_position = m_path[0];
    }
}

void VirtualAgent::update(float deltaTime)
{
    if (m_path.empty() || m_currentIndex >= m_path.size() - 1) return;

    cv::Point target = m_path[m_currentIndex + 1];

    // Simple movement towards target
    float dx = target.x - m_position.x;
    float dy = target.y - m_position.y;
    float dist = std::sqrt(dx*dx + dy*dy);

    if (dist < 5.0f) {
        // Reached node
        m_currentIndex++;
        m_position = target;
    } else {
        // Move
        float moveDist = m_speed * deltaTime;
        m_position.x += (dx / dist) * moveDist;
        m_position.y += (dy / dist) * moveDist;
    }
}

cv::Point VirtualAgent::getPosition() const
{
    return m_position;
}

bool VirtualAgent::hasReachedTarget() const
{
    return !m_path.empty() && m_currentIndex >= m_path.size() - 1;
}
