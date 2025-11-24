#include <QApplication>
#include <QCommandLineParser>
#include "UI/MainWindow.h"

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

    parser.process(app);

    bool testMode = parser.isSet(testOption);
    bool cameraTestMode = parser.isSet(cameraTestOption);

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
