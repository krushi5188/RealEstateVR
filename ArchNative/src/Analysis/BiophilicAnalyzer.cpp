#include "BiophilicAnalyzer.h"

float BiophilicAnalyzer::calculateScore(const Floor& floor)
{
    // Logic: Calculate total Window Width vs Total Wall Length (proxy for area)

    float totalWallLength = 0.0f;
    for (const auto& w : floor.walls) {
        totalWallLength += cv::norm(w.end - w.start);
    }

    float totalWindowWidth = 0.0f;
    for (const auto& w : floor.windows) {
        totalWindowWidth += w.width();
    }

    if (totalWallLength < 1.0f) return 0.0f;

    // Ratio: 0.0 to 1.0
    float ratio = totalWindowWidth / totalWallLength;

    // Score: Ideal ratio is maybe 20-30%?
    // Let's map ratio 0.3 -> 100 score

    float score = (ratio / 0.3f) * 100.0f;
    if (score > 100.0f) score = 100.0f;

    return score;
}
