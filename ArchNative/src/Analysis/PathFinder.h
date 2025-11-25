#ifndef PATHFINDER_H
#define PATHFINDER_H

#include "../Core/Project.h"
#include <vector>
#include <opencv2/opencv.hpp>

class PathFinder
{
public:
    PathFinder();

    // Finds a path from start to end avoiding walls in the floor
    std::vector<cv::Point> findPath(const Floor& floor, cv::Point start, cv::Point end);

private:
    struct Node {
        cv::Point pos;
        float gCost;
        float hCost;
        float fCost() const { return gCost + hCost; }
        cv::Point parent;
        bool operator>(const Node& other) const { return fCost() > other.fCost(); }
    };

    bool isWalkable(const Floor& floor, cv::Point p);
    float heuristic(cv::Point a, cv::Point b);
};

#endif // PATHFINDER_H
