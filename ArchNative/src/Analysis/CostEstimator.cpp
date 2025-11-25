#include "CostEstimator.h"
#include <cmath>

CostEstimator::CostEstimator()
    : m_wallUnitCost(150.0f), // $150 per sq meter
      m_windowUnitCost(500.0f), // $500 per window
      m_doorUnitCost(300.0f)    // $300 per door
{
}

void CostEstimator::setWallUnitCost(float cost) { m_wallUnitCost = cost; }
void CostEstimator::setWindowUnitCost(float cost) { m_windowUnitCost = cost; }
void CostEstimator::setDoorUnitCost(float cost) { m_doorUnitCost = cost; }

CostReport CostEstimator::calculate(const Project& project)
{
    CostReport report;
    report.totalCost = 0.0f;
    report.breakdown["Walls"] = 0.0f;
    report.breakdown["Windows"] = 0.0f;
    report.breakdown["Doors"] = 0.0f;

    for (const auto& floor : project.getFloors()) {
        // 1. Calculate Wall Cost
        float wallArea = 0.0f;
        float wallHeight = floor->getHeight(); // e.g. 3.0m

        for (const auto& wall : floor->walls) {
            // Length in pixels. We need a scale factor.
            // ImageProcessor logic had a scale guess, but here let's assume 1 pixel = 0.02 meters (2cm)
            // 600 pixels = 12 meters. Reasonable for a room.
            float scale = 0.02f;

            float lengthPixels = cv::norm(wall.end - wall.start);
            float lengthMeters = lengthPixels * scale;

            wallArea += lengthMeters * wallHeight;
        }

        float wallCost = wallArea * m_wallUnitCost;
        report.breakdown["Walls"] += wallCost;

        // 2. Fixtures
        float windowCost = floor->windows.size() * m_windowUnitCost;
        report.breakdown["Windows"] += windowCost;

        float doorCost = floor->doors.size() * m_doorUnitCost;
        report.breakdown["Doors"] += doorCost;
    }

    report.totalCost = report.breakdown["Walls"] + report.breakdown["Windows"] + report.breakdown["Doors"];
    return report;
}
