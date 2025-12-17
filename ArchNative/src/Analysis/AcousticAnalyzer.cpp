#include "AcousticAnalyzer.h"
#include <cmath>

float AcousticAnalyzer::calculateScore(const Floor& floor)
{
    // Simplified Logic:
    // Score increases with number of separate rooms (isolation)
    // Score decreases if rooms are too close (thin walls) - ignored for now

    if (floor.rooms.empty()) return 0.0f;

    // Base score 50
    float score = 50.0f;

    // +10 per room (up to 100)
    score += floor.rooms.size() * 10.0f;

    if (score > 100.0f) score = 100.0f;
    return score;
}
