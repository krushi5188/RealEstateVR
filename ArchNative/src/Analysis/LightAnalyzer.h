#ifndef LIGHTANALYZER_H
#define LIGHTANALYZER_H

#include "../Core/Project.h"
#include <vector>

struct LightMap {
    int width;
    int height;
    std::vector<float> data; // 0.0 (Shadow) to 1.0 (Lit)
};

class LightAnalyzer
{
public:
    LightAnalyzer();

    // Calculates light exposure for a specific floor at a given sun position
    // sunVector: Normalized direction TO the sun
    LightMap calculateExposure(const Floor& floor, float sunX, float sunY, float sunZ);

private:
    bool rayIntersectsWall(float ox, float oy, float dx, float dy, const Wall& wall);
};

#endif // LIGHTANALYZER_H
