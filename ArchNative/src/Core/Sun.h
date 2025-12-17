#ifndef SUN_H
#define SUN_H

#include <cmath>

struct SunPosition {
    float x, y, z; // Normalized vector
};

class Sun
{
public:
    Sun();

    void setTime(float hour); // 0.0 to 24.0
    SunPosition getPosition() const;

private:
    float m_hour;
    // Latitude/Longitude defaults could be added here
};

#endif // SUN_H
