#ifndef COSTESTIMATOR_H
#define COSTESTIMATOR_H

#include "../Core/Project.h"
#include <map>
#include <string>

struct CostReport {
    float totalCost;
    std::map<std::string, float> breakdown; // "Walls", "Windows", etc.
};

class CostEstimator
{
public:
    CostEstimator();

    // Set unit prices
    void setWallUnitCost(float costPerSqMeter);
    void setWindowUnitCost(float costPerUnit);
    void setDoorUnitCost(float costPerUnit);

    CostReport calculate(const Project& project);

private:
    float m_wallUnitCost;
    float m_windowUnitCost;
    float m_doorUnitCost;
};

#endif // COSTESTIMATOR_H
