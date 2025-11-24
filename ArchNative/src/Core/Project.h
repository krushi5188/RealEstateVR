#ifndef PROJECT_H
#define PROJECT_H

#include <vector>
#include <memory>
#include <string>
#include "Floor.h"
#include "ImageProcessor.h"

class Project
{
public:
    Project();
    ~Project();

    // Adds a new floor from an image file
    bool addFloor(const std::string& imagePath, const std::string& floorName);

    const std::vector<std::shared_ptr<Floor>>& getFloors() const { return m_floors; }

    // Future: saveToANVR, loadFromANVR

private:
    std::vector<std::shared_ptr<Floor>> m_floors;
    ImageProcessor m_processor; // Reused processor instance
};

#endif // PROJECT_H
