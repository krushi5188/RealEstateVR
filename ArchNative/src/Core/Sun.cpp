#include "Sun.h"

Sun::Sun() : m_hour(12.0f)
{
}

void Sun::setTime(float hour)
{
    m_hour = hour;
}

SunPosition Sun::getPosition() const
{
    // Simple Sun Path Logic
    // Noon (12) = High Noon (Y=1)
    // 6am = Sunrise (X=1, Y=0)
    // 6pm = Sunset (X=-1, Y=0)

    // Map hour to angle (0 to 2PI)
    // 6am -> 0 rad
    // 12pm -> PI/2 rad
    // 6pm -> PI rad

    float angle = (m_hour - 6.0f) * (M_PI / 12.0f);

    SunPosition pos;
    if (m_hour < 6.0f || m_hour > 18.0f) {
        // Night
        pos.x = 0; pos.y = -1; pos.z = 0;
    } else {
        pos.x = std::cos(angle); // East-West
        pos.y = std::sin(angle); // Up-Down (Elevation)
        pos.z = 0.2f; // Slight South tilt
    }
    return pos;
}
