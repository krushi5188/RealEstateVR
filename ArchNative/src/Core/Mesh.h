#ifndef MESH_H
#define MESH_H

#include <vector>

struct Vertex {
    float x, y, z;       // Position
    float nx, ny, nz;    // Normal
    // float u, v;       // Texture Coords (Future)
};

struct Mesh {
    std::vector<Vertex> vertices;
    std::vector<unsigned int> indices;

    void clear() {
        vertices.clear();
        indices.clear();
    }
};

#endif // MESH_H
