#include "LightAnalyzer.h"
#include <cmath>
#include <algorithm>

LightAnalyzer::LightAnalyzer()
{
}

LightMap LightAnalyzer::calculateExposure(const Floor& floor, float sunX, float sunY, float sunZ)
{
    // Simplified 2D Raycasting for Phase 4N (assuming sunY is elevation, ignoring vertical tilt for wall blocking for now)
    // We treat walls as infinitely high obstacles for the 2D projection, or check height if we want 3D.
    // For "Natural Light Analysis" in a floor plan view, 2D raycasting is the standard MVP.

    // 1. Determine bounds of the floor to create a grid
    // We'll use a fixed resolution for the heatmap (e.g., 1 pixel = 10cm or 1 unit)
    // For the test project, let's assume 600x600 image space.

    int width = 600;
    int height = 600;

    LightMap map;
    map.width = width;
    map.height = height;
    map.data.resize(width * height, 0.0f);

    // If sun is below horizon (Y < 0), it's night.
    if (sunY <= 0) return map;

    // 2D Sun Direction (projected onto ground plane)
    float len = std::sqrt(sunX*sunX + sunZ*sunZ);
    if (len < 0.001f) return map; // Sun is directly overhead (Zenith), effectively everything lit inside?
    // Actually if zenith, walls don't block downwards light unless we have a roof.
    // Let's assume directional side light for now.

    float dirX = sunX / len;
    float dirZ = sunZ / len; // Mapping 3D Z to 2D Y in image space if we treat Top-Down view

    // Iterate over every pixel
    for (int y = 0; y < height; y += 10) { // Step 10 for performance in MVP
        for (int x = 0; x < width; x += 10) {
            bool blocked = false;

            // Check ray against all walls
            for (const auto& wall : floor.walls) {
                // Wall segment
                float wx1 = wall.start.x;
                float wy1 = wall.start.y;
                float wx2 = wall.end.x;
                float wy2 = wall.end.y;

                // Ray: Origin(x,y) Direction(dirX, dirZ)
                // We cast Ray FROM the point TOWARDS the sun. If it hits a wall, it's in shadow.

                if (rayIntersectsWall(x, y, dirX, dirZ, wall)) {
                    blocked = true;
                    break;
                }
            }

            if (!blocked) {
                // Mark this block as lit
                // Fill the 10x10 block
                for(int dy=0; dy<10 && y+dy < height; dy++)
                    for(int dx=0; dx<10 && x+dx < width; dx++)
                        map.data[(y+dy)*width + (x+dx)] = 1.0f;
            }
        }
    }

    return map;
}

// Standard Line-Line Intersection
bool LightAnalyzer::rayIntersectsWall(float ox, float oy, float dx, float dy, const Wall& wall)
{
    float x1 = wall.start.x;
    float y1 = wall.start.y;
    float x2 = wall.end.x;
    float y2 = wall.end.y;

    float x3 = ox;
    float y3 = oy;
    float x4 = ox + dx * 10000.0f; // Far away point
    float y4 = oy + dy * 10000.0f;

    float den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (std::abs(den) < 0.001f) return false; // Parallel

    float t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    float u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;

    if (t >= 0 && t <= 1 && u >= 0) {
        return true; // Intersection
    }
    return false;
}
