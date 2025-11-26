#ifndef FURNITURELIBRARY_H
#define FURNITURELIBRARY_H

#include "Furniture.h"
#include <vector>
#include <optional>

class FurnitureLibrary
{
public:
    FurnitureLibrary();

    const std::vector<FurnitureItem>& getCatalog() const;
    std::optional<FurnitureItem> getItem(const std::string& id) const;

private:
    std::vector<FurnitureItem> m_catalog;
};

#endif // FURNITURELIBRARY_H
