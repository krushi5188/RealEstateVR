#ifndef MESHGENERATOR_H
#define MESHGENERATOR_H

#include "Project.h"
#include "Mesh.h"

class MeshGenerator
{
public:
    MeshGenerator();

    // Generates a combined mesh for the entire project
    Mesh generate(const Project& project);

private:
    void addWall(Mesh& mesh, const Wall& wall, float floorHeight, float floorElevation);

    // Helper to push a vertex
    void addVertex(Mesh& mesh, float x, float y, float z, float nx, float ny, float nz);
    // Helper to push a quad (2 triangles)
    void addQuad(Mesh& mesh, unsigned int v1, unsigned int v2, unsigned int v3, unsigned int v4);
};

#endif // MESHGENERATOR_H
