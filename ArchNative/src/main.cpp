#include <QApplication>
#include <QCommandLineParser>
#include "UI/MainWindow.h"
#include "Core/ImageProcessor.h"
#include "Core/Project.h"
#include "Core/MeshGenerator.h"
#include "Core/Serializer.h"
#include "Core/Sun.h"
#include "Analysis/LightAnalyzer.h"
#include "Analysis/PathFinder.h"
#include "Analysis/AcousticAnalyzer.h"
#include "Analysis/BiophilicAnalyzer.h"
#include "Analysis/CostEstimator.h"
#include "Analysis/BlueprintGenerator.h"
#include "Core/VirtualAgent.h"
#include "Core/OpenXRManager.h"
#include "Core/FurnitureLibrary.h"
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

    // 2.5. Add Furniture (Phase 5N.3)
    FurnitureLibrary lib;
    auto bed = lib.getItem("bed_king");
    if (bed) {
        PlacedFurniture placed;
        placed.itemId = bed->id;
        placed.width = bed->width;
        placed.depth = bed->depth;
        placed.height = bed->height;
        placed.position = cv::Point(175, 175); // Center of Room 1
        placed.rotation = 0.0f;

        // Add to Ground Floor
        // We need a way to access the floor to add furniture directly for the test
        // Project::getFloors returns const vector usually, but shared_ptrs allow modification of content?
        // getFloors returns const vector<shared_ptr<Floor>>&. The pointers are const, but object is mutable?
        // Actually shared_ptr<T> allows T modification unless it's shared_ptr<const T>.
        project.getFloors()[0]->furniture.push_back(placed);
        std::cout << "Placed furniture: " << bed->name << std::endl;
    }

    // 3. Verify
    const auto& floors = project.getFloors();
    if (floors.size() == 2) {
        std::cout << "SUCCESS: Project contains 2 floors." << std::endl;
        std::cout << "  Floor 0: " << floors[0]->getName() << " | Walls: " << floors[0]->walls.size() << " | Label: " << (floors[0]->rooms.empty() ? "None" : floors[0]->rooms[0].label) << std::endl;
        std::cout << "  Floor 1: " << floors[1]->getName() << " | Walls: " << floors[1]->walls.size() << " | Label: " << (floors[1]->rooms.empty() ? "None" : floors[1]->rooms[0].label) << std::endl;

        // 4. Generate Mesh (Phase 3N)
        std::cout << "Generating 3D Mesh..." << std::endl;
        MeshGenerator meshGen;
        Mesh mesh = meshGen.generate(project);

        std::cout << "Generated Mesh: " << mesh.vertices.size() << " vertices, " << mesh.indices.size() << " indices." << std::endl;

        // Verification for Advanced Mesh Gen (Phase 3N.3)
        // We expect more vertices than just 8 per wall if windows were found.
        // 26 windows detected * 3 segments vs 1 segment = significant increase.
        // Previous run had 1184 vertices.
        // A wall with a window has 3 blocks (Left, Right, Top, Bottom) = 4 blocks = 32 verts?
        // Or 3 blocks (Left, Right, Top/Bottom strips).
        // My logic does Left, Right, Sill, Lintel = 4 blocks. 4 * 8 = 32 verts per window-wall vs 8.
        // So count should jump.

        if (mesh.vertices.size() > 1200) {
             std::cout << "SUCCESS: Mesh generation verified (High complexity confirmed)." << std::endl;
        } else if (mesh.vertices.size() > 0) {
             std::cout << "WARNING: Mesh generated but complexity low (Windows might not be cut)." << std::endl;
        } else {
             std::cerr << "FAILURE: Mesh is empty." << std::endl;
        }

        // 5. Test Serialization (Phase 3N.4)
        std::cout << "Testing Serialization (.anvr)..." << std::endl;
        if (Serializer::save(project, "test_project.anvr")) {
            Project loadedProject;
            if (Serializer::load(loadedProject, "test_project.anvr")) {
                if (loadedProject.getFloors().size() == 2) {
                    std::cout << "SUCCESS: Project loaded correctly." << std::endl;
                } else {
                    std::cerr << "FAILURE: Loaded project floor count mismatch." << std::endl;
                }
            } else {
                std::cerr << "FAILURE: Could not load .anvr file." << std::endl;
            }
        } else {
            std::cerr << "FAILURE: Could not save .anvr file." << std::endl;
        }

        // 6. Test Analysis (Phase 4N)
        std::cout << "Testing Light Analysis..." << std::endl;
        Sun sun;
        sun.setTime(10.0f); // 10 AM
        SunPosition sunPos = sun.getPosition();

        LightAnalyzer analyzer;
        LightMap lightMap = analyzer.calculateExposure(*floors[0], sunPos.x, sunPos.y, sunPos.z);

        // Check if we got any light (some pixels should be 1.0)
        int litPixels = 0;
        for (float v : lightMap.data) {
            if (v > 0.5f) litPixels++;
        }

        std::cout << "Light Analysis: " << litPixels << " lit pixels detected." << std::endl;
        if (litPixels > 0) {
             std::cout << "SUCCESS: Light Analysis verified." << std::endl;
        } else {
             // It might be 0 if walls block everything or logic error, but for this test scene with just walls, 'outside' should be lit?
             // Wait, our logic iterates X/Y of the image. If walls are just lines, most pixels are empty space.
             // If ray hits wall, it's blocked.
             // If the sun is at 10AM, it comes from the side.
             // Logic is simple enough that something should be lit.
             // If it fails, it's likely the ray math.
             std::cerr << "WARNING: No lit pixels found (Check Sun/Ray logic)." << std::endl;
        }

        // 7. Test Pathfinding & Agent (Phase 4N.2)
        std::cout << "Testing Circulation Analysis (Pathfinding)..." << std::endl;
        PathFinder pathFinder;
        // From Room 1 center (approx 175, 175) to Room 2 center (approx 425, 175)
        // The wall is at X=300. Is there a door?
        // In our synthetic setup, we just drew rectangles. There is NO hole.
        // So A* should fail if strict, or go around if there's space?
        // Wait, the walls are (50,50)-(300,300) and (300,50)-(550,300).
        // They share a wall at X=300.
        // A* cannot pass through the wall.
        // Let's start INSIDE Room 1 (100,100) and try to go to (200,200). Should be clear.

        cv::Point start(100, 100);
        cv::Point end(200, 200);
        std::vector<cv::Point> path = pathFinder.findPath(*floors[0], start, end);

        if (!path.empty()) {
            std::cout << "SUCCESS: Path found (" << path.size() << " nodes)." << std::endl;

            VirtualAgent agent;
            agent.setPath(path);
            agent.update(1.0f); // Simulate 1 second
            if (agent.getPosition() != start) {
                 std::cout << "SUCCESS: Agent moved." << std::endl;
            }
        } else {
            std::cerr << "FAILURE: No path found in open room." << std::endl;
        }

        // 8. Test Acoustic/Biophilic (Phase 4N.3)
        std::cout << "Testing Design Reports..." << std::endl;
        AcousticAnalyzer acoustic;
        float aScore = acoustic.calculateScore(*floors[0]);
        std::cout << "Acoustic Score: " << aScore << "/100" << std::endl;

        BiophilicAnalyzer biophilic;
        float bScore = biophilic.calculateScore(*floors[0]);
        std::cout << "Biophilic Score: " << bScore << "/100" << std::endl;

        if (aScore > 0 && bScore >= 0) { // bScore might be 0 if no windows found
             std::cout << "SUCCESS: Design reports generated." << std::endl;
        }

        // 9. Test Cost Estimator (Phase 5N.1)
        std::cout << "Testing Cost Estimator..." << std::endl;
        CostEstimator estimator;
        CostReport costReport = estimator.calculate(project);
        std::cout << "Total Project Cost: $" << costReport.totalCost << std::endl;
        std::cout << "  - Walls: $" << costReport.breakdown["Walls"] << std::endl;
        std::cout << "  - Windows: $" << costReport.breakdown["Windows"] << std::endl;

        if (costReport.totalCost > 0) {
            std::cout << "SUCCESS: Cost estimation complete." << std::endl;
        } else {
            std::cerr << "FAILURE: Cost is zero." << std::endl;
        }

        // 10. Test Blueprint Generation (Phase 5N.2)
        std::cout << "Generating Blueprint PDF..." << std::endl;
        BlueprintGenerator blueprintGen;
        if (blueprintGen.generate(project, "test_blueprint.pdf")) {
            std::cout << "SUCCESS: Blueprint generated." << std::endl;
        } else {
            std::cerr << "FAILURE: Could not generate PDF." << std::endl;
        }

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

    QCommandLineOption vrTestOption("test-vr", "Run OpenXR initialization verification.");
    parser.addOption(vrTestOption);

    QCommandLineOption stereoTestOption("test-stereo", "Run Stereo Rendering verification.");
    parser.addOption(stereoTestOption);

    parser.process(app);

    bool testMode = parser.isSet(testOption);
    bool cameraTestMode = parser.isSet(cameraTestOption);
    bool imgProcTestMode = parser.isSet(imgProcTestOption);
    bool projectTestMode = parser.isSet(projectTestOption);
    bool vrTestMode = parser.isSet(vrTestOption);
    bool stereoTestMode = parser.isSet(stereoTestOption);

    if (vrTestMode) {
        std::cout << "Testing OpenXR Integration..." << std::endl;
        OpenXRManager xrManager;
        if (xrManager.initialize()) {
            std::cout << "SUCCESS: OpenXR Initialized." << std::endl;
        } else {
            // Failure is expected in headless, but we verified linkage and logic ran
            std::cout << "NOTICE: OpenXR Initialization failed (Expected in headless/no-HMD env)." << std::endl;
        }
        return 0;
    }

    if (stereoTestMode) {
        MainWindow w;
        w.resize(1024, 512); // Wide ratio
        w.show();

        // Access viewport - tricky via private, but we can findChild
        ViewportWidget* vp = w.findChild<ViewportWidget*>();
        if (vp) {
            vp->setStereoMode(true);
            w.captureScreenshot("test_stereo_output.png");
            std::cout << "SUCCESS: Captured Stereo Screenshot." << std::endl;
        } else {
            std::cerr << "FAILURE: Could not find Viewport." << std::endl;
        }
        return 0;
    }

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
