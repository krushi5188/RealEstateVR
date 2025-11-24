#include <QApplication>
#include <QCommandLineParser>
#include "UI/MainWindow.h"
#include "Core/ImageProcessor.h"
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

void runImageProcTest() {
    // 1. Generate Synthetic Floor Plan
    // White background (255), Black walls (0)
    cv::Mat synthetic = cv::Mat(200, 200, CV_8UC3, cv::Scalar(255, 255, 255));

    // Draw a black rectangle (Wall)
    cv::rectangle(synthetic, cv::Point(50, 50), cv::Point(150, 150), cv::Scalar(0, 0, 0), 5); // Thickness 5

    std::string inputPath = "test_input_floor.png";
    cv::imwrite(inputPath, synthetic);
    std::cout << "Generated test input: " << inputPath << std::endl;

    // 2. Load and Process
    ImageProcessor proc;
    if (proc.load(inputPath)) {
        proc.process();
        if (proc.saveDebug("test_processed.png")) {
            std::cout << "Saved processed output: test_processed.png" << std::endl;
        } else {
            std::cerr << "Failed to save processed output." << std::endl;
        }
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

    parser.process(app);

    bool testMode = parser.isSet(testOption);
    bool cameraTestMode = parser.isSet(cameraTestOption);
    bool imgProcTestMode = parser.isSet(imgProcTestOption);

    if (imgProcTestMode) {
        runImageProcTest();
        return 0; // Exit after test (Headless)
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
