#ifndef BIOPHILICANALYZER_H
#define BIOPHILICANALYZER_H

#include "../Core/Project.h"

class BiophilicAnalyzer
{
public:
    // Returns a score (0-100) based on Window-to-Floor ratio
    float calculateScore(const Floor& floor);
};

#endif // BIOPHILICANALYZER_H
