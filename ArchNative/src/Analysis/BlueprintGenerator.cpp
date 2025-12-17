#include "BlueprintGenerator.h"
#include <QPdfWriter>
#include <QPainter>
#include <QPageSize>
#include <iostream>

BlueprintGenerator::BlueprintGenerator()
{
}

bool BlueprintGenerator::generate(const Project& project, const std::string& filename)
{
    QPdfWriter writer(QString::fromStdString(filename));
    writer.setPageSize(QPageSize(QPageSize::A4));
    writer.setResolution(300); // 300 DPI
    writer.setCreator("ArchNative Studio");
    writer.setTitle("Project Blueprint");

    QPainter painter(&writer);
    if (!painter.isActive()) {
        std::cerr << "Failed to initialize QPainter for PDF export." << std::endl;
        return false;
    }

    // Scale: Fit 600px floor plan into ~2000px width A4
    float scale = 3.0f;
    int yOffset = 300; // Margin for title

    for (const auto& floor : project.getFloors()) {
        painter.save();

        // Draw Title Block
        painter.setPen(Qt::black);
        painter.setFont(QFont("Arial", 24, QFont::Bold));
        painter.drawText(100, 100 + (floor->getLevel() * 3000), "ArchNative Blueprint"); // Simplified multi-page simulation

        painter.setFont(QFont("Arial", 14));
        painter.drawText(100, 150 + (floor->getLevel() * 3000), QString::fromStdString("Floor: " + floor->getName()));

        // Transform for drawing
        // In a real app, we'd use writer.newPage() for each floor.
        // For this single-page test or simple stack, let's just draw one floor.
        if (floor->getLevel() > 0) {
            writer.newPage();
            yOffset = 300;
        }

        painter.translate(100, yOffset);
        painter.scale(scale, scale);

        // Draw Walls
        painter.setPen(QPen(Qt::black, 3));
        for (const auto& wall : floor->walls) {
            painter.drawLine(wall.start.x, wall.start.y, wall.end.x, wall.end.y);
        }

        // Draw Windows (Cyan lines)
        painter.setPen(QPen(Qt::cyan, 3));
        for (const auto& win : floor->windows) {
            painter.drawLine(win.start.x, win.start.y, win.end.x, win.end.y);
        }

        // Draw Room Labels
        painter.setPen(Qt::darkBlue);
        painter.setFont(QFont("Arial", 8));
        for (const auto& room : floor->rooms) {
            // Center text
            QRect rect(room.bounds.x, room.bounds.y, room.bounds.width, room.bounds.height);
            painter.drawText(rect, Qt::AlignCenter, QString::fromStdString(room.label));

            // Draw faint room border
            painter.setPen(QPen(Qt::lightGray, 1, Qt::DashLine));
            painter.drawRect(rect);
        }

        painter.restore();
    }

    painter.end();
    std::cout << "Generated Blueprint: " << filename << std::endl;
    return true;
}
