#ifndef FLOOR_H
#define FLOOR_H

#include <string>
#include <vector>
#include "ImageProcessor.h" // For Wall and Room structs
#include "Furniture.h"

class Floor
{
public:
    Floor(int level, const std::string& name) : m_level(level), m_name(name), m_height(3.0f) {}

    int getLevel() const { return m_level; }
    std::string getName() const { return m_name; }
    float getHeight() const { return m_height; } // Height of walls in meters (default 3.0)

    // Data detected by ImageProcessor
    std::vector<Wall> walls;
    std::vector<Room> rooms;
    std::vector<ArchWindow> windows;
    std::vector<ArchDoor> doors;
    std::vector<PlacedFurniture> furniture;

private:
    int m_level;        // 0 = Ground, 1 = First Floor, etc.
    std::string m_name; // e.g., "Ground Floor"
    float m_height;
};

#endif // FLOOR_H
