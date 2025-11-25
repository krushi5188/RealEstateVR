#ifndef ACOUSTICANALYZER_H
#define ACOUSTICANALYZER_H

#include "../Core/Project.h"

class AcousticAnalyzer
{
public:
    // Returns a simplified score (0-100) based on room isolation
    float calculateScore(const Floor& floor);
};

#endif // ACOUSTICANALYZER_H
