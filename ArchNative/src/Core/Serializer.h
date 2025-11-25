#ifndef SERIALIZER_H
#define SERIALIZER_H

#include "Project.h"
#include <string>
#include <fstream>
#include <vector>

class Serializer
{
public:
    static bool save(const Project& project, const std::string& filename);
    static bool load(Project& project, const std::string& filename);

private:
    // Helpers for binary IO
    static void writeString(std::ofstream& out, const std::string& str);
    static std::string readString(std::ifstream& in);
};

#endif // SERIALIZER_H
