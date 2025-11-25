#include "PathFinder.h"
#include <queue>
#include <unordered_map>
#include <cmath>
#include <iostream>

// Simple grid resolution for pathfinding
const int GRID_STEP = 10;

// Hash function for cv::Point to use in unordered_map
struct PointHash {
    size_t operator()(const cv::Point& p) const {
        return std::hash<int>()(p.x) ^ (std::hash<int>()(p.y) << 1);
    }
};

PathFinder::PathFinder()
{
}

float PathFinder::heuristic(cv::Point a, cv::Point b)
{
    return std::abs(a.x - b.x) + std::abs(a.y - b.y); // Manhattan distance
}

bool PathFinder::isWalkable(const Floor& floor, cv::Point p)
{
    // Check bounds (assuming 600x600 for the test project, ideally passed in)
    if (p.x < 0 || p.y < 0 || p.x >= 600 || p.y >= 600) return false;

    // Simple collision check against walls
    // Ideally we use a rasterized grid map, but checking walls vector is okay for small counts
    for (const auto& wall : floor.walls) {
        // Check distance to line segment
        // Simplified: Checking if point is close to wall line
        // For Phase 4N prototype, let's just assume if it hits exact pixels it fails?
        // No, vector math needed.

        // Let's treat walls as bounding boxes for A* check to be fast
        int minX = std::min(wall.start.x, wall.end.x) - 5;
        int maxX = std::max(wall.start.x, wall.end.x) + 5;
        int minY = std::min(wall.start.y, wall.end.y) - 5;
        int maxY = std::max(wall.start.y, wall.end.y) + 5;

        if (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY) {
            return false;
        }
    }
    return true;
}

std::vector<cv::Point> PathFinder::findPath(const Floor& floor, cv::Point start, cv::Point end)
{
    std::priority_queue<Node, std::vector<Node>, std::greater<Node>> openSet;
    std::unordered_map<cv::Point, cv::Point, PointHash> cameFrom;
    std::unordered_map<cv::Point, float, PointHash> gScore;

    // Snap start/end to grid
    start.x = (start.x / GRID_STEP) * GRID_STEP;
    start.y = (start.y / GRID_STEP) * GRID_STEP;
    end.x = (end.x / GRID_STEP) * GRID_STEP;
    end.y = (end.y / GRID_STEP) * GRID_STEP;

    openSet.push({start, 0, heuristic(start, end), {0,0}});
    gScore[start] = 0;

    std::vector<cv::Point> path;

    while (!openSet.empty()) {
        Node current = openSet.top();
        openSet.pop();

        if (current.pos == end) {
            // Reconstruct path
            cv::Point curr = end;
            while (curr != start) {
                path.push_back(curr);
                curr = cameFrom[curr];
            }
            path.push_back(start);
            std::reverse(path.begin(), path.end());
            return path;
        }

        // Neighbors (4-way)
        cv::Point neighbors[4] = {
            {current.pos.x + GRID_STEP, current.pos.y},
            {current.pos.x - GRID_STEP, current.pos.y},
            {current.pos.x, current.pos.y + GRID_STEP},
            {current.pos.x, current.pos.y - GRID_STEP}
        };

        for (cv::Point neighbor : neighbors) {
            if (!isWalkable(floor, neighbor)) continue;

            float tentativeG = gScore[current.pos] + GRID_STEP;
            if (gScore.find(neighbor) == gScore.end() || tentativeG < gScore[neighbor]) {
                cameFrom[neighbor] = current.pos;
                gScore[neighbor] = tentativeG;
                openSet.push({neighbor, tentativeG, heuristic(neighbor, end), current.pos});
            }
        }
    }

    std::cerr << "Pathfinding failed: No path found." << std::endl;
    return path; // Empty
}
