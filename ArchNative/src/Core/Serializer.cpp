#include "Serializer.h"
#include <iostream>
#include <cstdint>

// Magic Header: "ANVR"
const char MAGIC[] = {'A', 'N', 'V', 'R'};
const uint32_t VERSION = 1;

bool Serializer::save(const Project& project, const std::string& filename)
{
    std::ofstream out(filename, std::ios::binary);
    if (!out.is_open()) {
        std::cerr << "Failed to open file for writing: " << filename << std::endl;
        return false;
    }

    // Header
    out.write(MAGIC, 4);
    out.write(reinterpret_cast<const char*>(&VERSION), sizeof(VERSION));

    // Floors
    const auto& floors = project.getFloors();
    uint32_t floorCount = floors.size();
    out.write(reinterpret_cast<const char*>(&floorCount), sizeof(floorCount));

    for (const auto& floor : floors) {
        int level = floor->getLevel();
        out.write(reinterpret_cast<const char*>(&level), sizeof(level));

        writeString(out, floor->getName());

        // Walls
        uint32_t wallCount = floor->walls.size();
        out.write(reinterpret_cast<const char*>(&wallCount), sizeof(wallCount));
        for (const auto& wall : floor->walls) {
            out.write(reinterpret_cast<const char*>(&wall.start.x), sizeof(int));
            out.write(reinterpret_cast<const char*>(&wall.start.y), sizeof(int));
            out.write(reinterpret_cast<const char*>(&wall.end.x), sizeof(int));
            out.write(reinterpret_cast<const char*>(&wall.end.y), sizeof(int));
        }

        // Rooms
        uint32_t roomCount = floor->rooms.size();
        out.write(reinterpret_cast<const char*>(&roomCount), sizeof(roomCount));
        for (const auto& room : floor->rooms) {
            out.write(reinterpret_cast<const char*>(&room.bounds.x), sizeof(int));
            out.write(reinterpret_cast<const char*>(&room.bounds.y), sizeof(int));
            out.write(reinterpret_cast<const char*>(&room.bounds.width), sizeof(int));
            out.write(reinterpret_cast<const char*>(&room.bounds.height), sizeof(int));
            writeString(out, room.label);
        }
    }

    out.close();
    std::cout << "Saved project to " << filename << std::endl;
    return true;
}

bool Serializer::load(Project& project, const std::string& filename)
{
    std::ifstream in(filename, std::ios::binary);
    if (!in.is_open()) {
        std::cerr << "Failed to open file for reading: " << filename << std::endl;
        return false;
    }

    // Header
    char magic[4];
    in.read(magic, 4);
    if (magic[0] != 'A' || magic[1] != 'N' || magic[2] != 'V' || magic[3] != 'R') {
        std::cerr << "Invalid file format (Magic mismatch)." << std::endl;
        return false;
    }

    uint32_t version;
    in.read(reinterpret_cast<char*>(&version), sizeof(version));
    if (version != VERSION) {
        std::cerr << "Unsupported version: " << version << std::endl;
        return false;
    }

    // Floors
    uint32_t floorCount;
    in.read(reinterpret_cast<char*>(&floorCount), sizeof(floorCount));

    for (uint32_t i = 0; i < floorCount; ++i) {
        int level;
        in.read(reinterpret_cast<char*>(&level), sizeof(level));

        std::string name = readString(in);

        // Create floor via Project helper (internal or just manually add)
        // Since Project::addFloor currently takes an image path, we might need a direct way to add a Floor object.
        // For now, we will need to extend Project to allow manual floor insertion or just use friend access if we were inside Project.
        // Let's assume we can add a floor manually. We need to update Project.h for this.

        // Temporary: We need a way to construct a floor and add it.
        // Since we are external, we can't easily add to Project unless it exposes a method.
        // I will update Project.h in the next step to allow `addFloor(std::shared_ptr<Floor>)`.

        auto floor = std::make_shared<Floor>(level, name);

        // Walls
        uint32_t wallCount;
        in.read(reinterpret_cast<char*>(&wallCount), sizeof(wallCount));
        for (uint32_t w = 0; w < wallCount; ++w) {
            Wall wall;
            in.read(reinterpret_cast<char*>(&wall.start.x), sizeof(int));
            in.read(reinterpret_cast<char*>(&wall.start.y), sizeof(int));
            in.read(reinterpret_cast<char*>(&wall.end.x), sizeof(int));
            in.read(reinterpret_cast<char*>(&wall.end.y), sizeof(int));
            floor->walls.push_back(wall);
        }

        // Rooms
        uint32_t roomCount;
        in.read(reinterpret_cast<char*>(&roomCount), sizeof(roomCount));
        for (uint32_t r = 0; r < roomCount; ++r) {
            Room room;
            in.read(reinterpret_cast<char*>(&room.bounds.x), sizeof(int));
            in.read(reinterpret_cast<char*>(&room.bounds.y), sizeof(int));
            in.read(reinterpret_cast<char*>(&room.bounds.width), sizeof(int));
            in.read(reinterpret_cast<char*>(&room.bounds.height), sizeof(int));
            room.label = readString(in);
            floor->rooms.push_back(room);
        }

        project.addExistingFloor(floor); // Need to implement this
    }

    in.close();
    return true;
}

void Serializer::writeString(std::ofstream& out, const std::string& str)
{
    uint32_t len = str.size();
    out.write(reinterpret_cast<const char*>(&len), sizeof(len));
    out.write(str.c_str(), len);
}

std::string Serializer::readString(std::ifstream& in)
{
    uint32_t len;
    in.read(reinterpret_cast<char*>(&len), sizeof(len));
    std::string str(len, '\0');
    in.read(&str[0], len);
    return str;
}
