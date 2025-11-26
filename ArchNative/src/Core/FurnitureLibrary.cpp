#include "FurnitureLibrary.h"

FurnitureLibrary::FurnitureLibrary()
{
    // Hardcoded catalog mirroring legacy JS
    m_catalog.push_back({"chair", "Modern Chair", 0.5f, 0.5f, 1.0f, 150.0f});
    m_catalog.push_back({"table", "Dining Table", 1.5f, 0.8f, 0.8f, 500.0f});
    m_catalog.push_back({"bed_king", "King Size Bed", 2.0f, 2.0f, 0.6f, 1200.0f});
    m_catalog.push_back({"sofa", "L-Shape Sofa", 2.5f, 1.0f, 0.9f, 1800.0f});
    m_catalog.push_back({"plant", "Potted Plant", 0.4f, 0.4f, 1.2f, 80.0f});
}

const std::vector<FurnitureItem>& FurnitureLibrary::getCatalog() const
{
    return m_catalog;
}

std::optional<FurnitureItem> FurnitureLibrary::getItem(const std::string& id) const
{
    for (const auto& item : m_catalog) {
        if (item.id == id) return item;
    }
    return std::nullopt;
}
