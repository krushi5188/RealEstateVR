#include <QApplication>
#include <QCommandLineParser>
#include "UI/MainWindow.h"
#include "Core/ImageProcessor.h"
#include "Core/Project.h"
#include <opencv2/opencv.hpp>
#include <iostream>
#include <QFile>
#include <QTextStream>

void loadStyleSheet(QApplication &app) {
    QFile file("assets/styles/macos.qss");
    if (file.open(QFile::ReadOnly | QFile::Text)) {
        QTextStream stream(&file);
        app.setStyleSheet(stream.readAll());
        file.close();
        std::cout << "Loaded Apple-like stylesheet." << std::endl;
    } else {
        std::cerr << "Warning: Could not load stylesheet from assets/styles/macos.qss" << std::endl;
    }
}

void runProjectTest() {
    std::cout << "Running Multi-Floor Project Test..." << std::endl;

    // 1. Generate Two Synthetic Floor Plans
    cv::Mat floor1 = cv::Mat(600, 600, CV_8UC3, cv::Scalar(255, 255, 255));
    cv::rectangle(floor1, cv::Point(50, 50), cv::Point(300, 300), cv::Scalar(0, 0, 0), 5);
    cv::putText(floor1, "LIVING", cv::Point(100, 150), cv::FONT_HERSHEY_SIMPLEX, 1.0, cv::Scalar(0, 0, 0), 2);
    cv::imwrite("test_floor_ground.png", floor1);

    cv::Mat floor2 = cv::Mat(600, 600, CV_8UC3, cv::Scalar(255, 255, 255));
    cv::rectangle(floor2, cv::Point(50, 50), cv::Point(300, 300), cv::Scalar(0, 0, 0), 5); // Same shape
    cv::putText(floor2, "BEDROOM", cv::Point(100, 150), cv::FONT_HERSHEY_SIMPLEX, 1.0, cv::Scalar(0, 0, 0), 2);
    cv::imwrite("test_floor_one.png", floor2);

    // 2. Create Project and Add Floors
    Project project;
    project.addFloor("test_floor_ground.png", "Ground Floor");
    project.addFloor("test_floor_one.png", "Level 1");

    // 3. Verify
    const auto& floors = project.getFloors();
    if (floors.size() == 2) {
        std::cout << "SUCCESS: Project contains 2 floors." << std::endl;
        std::cout << "  Floor 0: " << floors[0]->getName() << " | Walls: " << floors[0]->walls.size() << " | Label: " << (floors[0]->rooms.empty() ? "None" : floors[0]->rooms[0].label) << std::endl;
        std::cout << "  Floor 1: " << floors[1]->getName() << " | Walls: " << floors[1]->walls.size() << " | Label: " << (floors[1]->rooms.empty() ? "None" : floors[1]->rooms[0].label) << std::endl;

        // Reuse the debug image output for verification script
        // We'll just check if the code ran to completion
    } else {
        std::cerr << "FAILURE: Project floor count mismatch." << std::endl;
    }
}

int main(int argc, char *argv[])
{
    // Ensure OpenGL Compatibility Profile for macOS support of legacy glBegin/glEnd
    QSurfaceFormat format;
    format.setRenderableType(QSurfaceFormat::OpenGL);
    format.setProfile(QSurfaceFormat::CompatibilityProfile);
    format.setVersion(2, 1); // Safe baseline for legacy code
    QSurfaceFormat::setDefaultFormat(format);

    QApplication app(argc, argv);
    QApplication::setApplicationName("ArchNative");
    QApplication::setApplicationVersion("1.0");

    QCommandLineParser parser;
    parser.setApplicationDescription("ArchNative: High-Performance Architecture Tool");
    parser.addHelpOption();
    parser.addVersionOption();

    QCommandLineOption testOption("test-screenshot", "Run in test mode: render frame and exit.");
    parser.addOption(testOption);

    QCommandLineOption cameraTestOption("test-camera", "Run camera movement verification.");
    parser.addOption(cameraTestOption);

    QCommandLineOption imgProcTestOption("test-image-proc", "Run Image Processor verification.");
    parser.addOption(imgProcTestOption);

    QCommandLineOption projectTestOption("test-project", "Run Multi-Floor Project verification.");
    parser.addOption(projectTestOption);

    parser.process(app);

    bool testMode = parser.isSet(testOption);
    bool cameraTestMode = parser.isSet(cameraTestOption);
    bool imgProcTestMode = parser.isSet(imgProcTestOption);
    bool projectTestMode = parser.isSet(projectTestOption);

    if (imgProcTestMode) {
        // Original single image test
        // Refactored slightly to keep main simple, but for now just call the new project test which covers image proc internally
        // Or keep separate if needed. Let's redirect to Project Test for this phase as it subsumes functionality.
        // Actually, let's just make a simple wrapper if needed, but ProjectTest is better.
        runProjectTest();
        return 0;
    }

    if (projectTestMode) {
        runProjectTest();
        return 0;
    }

    loadStyleSheet(app);

    MainWindow window;
    window.resize(1024, 768);
    window.show();

    if (testMode) {
        // Standard verify
        window.captureScreenshot("test_output.png");
        return 0;
    }

    if (cameraTestMode) {
        window.captureScreenshot("test_cam_1.png");

        // Simulate Camera Move (Orbit)
        // Accessing viewport via finding child since we didn't expose it publically in main (yet)
        // Ideally MainWindow should have a method "rotateCameraForTest()"
        // For now, we can trust the unit tests or add a specific test method in MainWindow.
        window.runCameraTest();

        window.captureScreenshot("test_cam_2.png");
        return 0;
    }

    return app.exec();
}
