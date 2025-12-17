#ifndef BLUEPRINTGENERATOR_H
#define BLUEPRINTGENERATOR_H

#include "../Core/Project.h"
#include <string>

class BlueprintGenerator
{
public:
    BlueprintGenerator();

    // Generates a PDF blueprint for the project
    bool generate(const Project& project, const std::string& filename);
};

#endif // BLUEPRINTGENERATOR_H
