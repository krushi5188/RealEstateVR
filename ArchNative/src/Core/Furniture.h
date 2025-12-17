#ifndef FURNITURE_H
#define FURNITURE_H

#include <string>
#include <opencv2/core/types.hpp> // for cv::Point

struct FurnitureItem {
    std::string id;
    std::string name;
    float width;  // meters
    float depth;  // meters
    float height; // meters
    float price;  // USD
};

struct PlacedFurniture {
    std::string itemId;
    cv::Point position; // Center position (2D floor plan coordinates)
    float rotation;     // Degrees
    // We store a copy of dimensions for easier mesh gen, or look it up from library
    float width, depth, height;
};

#endif // FURNITURE_H
