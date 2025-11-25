#include "Project.h"
#include <iostream>

Project::Project()
{
}

Project::~Project()
{
}

bool Project::addFloor(const std::string& imagePath, const std::string& floorName)
{
    int level = m_floors.size(); // Auto-increment level
    auto newFloor = std::make_shared<Floor>(level, floorName);

    std::cout << "Processing Floor " << level << ": " << floorName << " from " << imagePath << "..." << std::endl;

    if (!m_processor.load(imagePath)) {
        return false;
    }

    // Run the pipeline
    m_processor.process();

    // Copy results to the Floor object
    newFloor->walls = m_processor.getWalls();
    newFloor->rooms = m_processor.getRooms();
    newFloor->windows = m_processor.getWindows();
    newFloor->doors = m_processor.getDoors();

    m_floors.push_back(newFloor);
    return true;
}
