#include "MeshGenerator.h"
#include <cmath>

MeshGenerator::MeshGenerator()
{
}

Mesh MeshGenerator::generate(const Project& project)
{
    Mesh mesh;
    float currentElevation = 0.0f;

    for (const auto& floor : project.getFloors()) {
        float wallHeight = floor->getHeight(); // Typically 3.0m or 10ft

        for (const auto& wall : floor->walls) {
            addWall(mesh, wall, wallHeight, currentElevation);
        }

        currentElevation += wallHeight;
        // Add slab thickness if we want realism, for now just stack walls
    }

    return mesh;
}

void MeshGenerator::addVertex(Mesh& mesh, float x, float y, float z, float nx, float ny, float nz)
{
    mesh.vertices.push_back({x, y, z, nx, ny, nz});
}

void MeshGenerator::addQuad(Mesh& mesh, unsigned int v1, unsigned int v2, unsigned int v3, unsigned int v4)
{
    // Triangle 1
    mesh.indices.push_back(v1);
    mesh.indices.push_back(v2);
    mesh.indices.push_back(v3);

    // Triangle 2
    mesh.indices.push_back(v1);
    mesh.indices.push_back(v3);
    mesh.indices.push_back(v4);
}

void MeshGenerator::addWall(Mesh& mesh, const Wall& wall, float height, float elevation)
{
    // Wall Logic:
    // Input: Start(x1, y1), End(x2, y2) in 2D pixel space.
    // We map pixel X -> 3D X, pixel Y -> 3D Z (Y-up system).
    // Elevation -> 3D Y.

    float x1 = wall.start.x;
    float z1 = wall.start.y;
    float x2 = wall.end.x;
    float z2 = wall.end.y;

    float yBottom = elevation;
    float yTop = elevation + height;

    // Thickness logic
    // Compute direction vector
    float dx = x2 - x1;
    float dz = z2 - z1;
    float len = std::sqrt(dx*dx + dz*dz);
    if (len < 0.001f) return;

    float ux = dx / len;
    float uz = dz / len;

    // Perpendicular vector (for thickness)
    float thickness = 10.0f; // Pixel thickness (approx)
    float px = -uz * (thickness / 2.0f);
    float pz = ux * (thickness / 2.0f);

    // 4 Base Corners
    // A: Start - perp
    float ax = x1 + px; float az = z1 + pz;
    // B: Start + perp
    float bx = x1 - px; float bz = z1 - pz;
    // C: End + perp
    float cx = x2 - px; float cz = z2 - pz;
    // D: End - perp
    float dx_pos = x2 + px; float dz_pos = z2 + pz;

    unsigned int startIdx = mesh.vertices.size();

    // Vertices (8 per cuboid)
    // Bottom Ring (0-3)
    addVertex(mesh, ax, yBottom, az, 0, 0, 0); // 0
    addVertex(mesh, bx, yBottom, bz, 0, 0, 0); // 1
    addVertex(mesh, cx, yBottom, cz, 0, 0, 0); // 2
    addVertex(mesh, dx_pos, yBottom, dz_pos, 0, 0, 0); // 3

    // Top Ring (4-7)
    addVertex(mesh, ax, yTop, az, 0, 0, 0); // 4
    addVertex(mesh, bx, yTop, bz, 0, 0, 0); // 5
    addVertex(mesh, cx, yTop, cz, 0, 0, 0); // 6
    addVertex(mesh, dx_pos, yTop, dz_pos, 0, 0, 0); // 7

    // Faces
    // Front (A-D)
    addQuad(mesh, startIdx + 0, startIdx + 4, startIdx + 7, startIdx + 3);
    // Back (B-C)
    addQuad(mesh, startIdx + 1, startIdx + 2, startIdx + 6, startIdx + 5);
    // Left (A-B) (Start cap)
    addQuad(mesh, startIdx + 0, startIdx + 1, startIdx + 5, startIdx + 4);
    // Right (D-C) (End cap)
    addQuad(mesh, startIdx + 3, startIdx + 7, startIdx + 6, startIdx + 2);
    // Top
    addQuad(mesh, startIdx + 4, startIdx + 5, startIdx + 6, startIdx + 7);
    // Bottom
    addQuad(mesh, startIdx + 0, startIdx + 3, startIdx + 2, startIdx + 1);
}
