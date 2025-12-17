#include "MainWindow.h"
#include <QApplication>
#include <QScreen>
#include <QTimer>
#include <QToolBar>
#include <QAction>
#include <QStatusBar>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
{
    // Apple-like Toolbar
    QToolBar *toolbar = addToolBar("Main Toolbar");
    toolbar->setMovable(false);
    toolbar->setFloatable(false);
    toolbar->setContextMenuPolicy(Qt::PreventContextMenu); // Clean look

    QAction *actImport = toolbar->addAction("Import Floor Plan");
    QAction *actAnalyze = toolbar->addAction("Analyze (AI)");
    QAction *actVR = toolbar->addAction("Enter VR Mode");
    QWidget* spacer = new QWidget();
    spacer->setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Preferred);
    toolbar->addWidget(spacer);
    QAction *actExport = toolbar->addAction("Export .anvr");

    // Central Viewport with margins for aesthetic framing
    QWidget *centralContainer = new QWidget(this);
    QVBoxLayout *layout = new QVBoxLayout(centralContainer);
    layout->setContentsMargins(10, 10, 10, 10); // Spacing around the viewport

    viewport = new ViewportWidget(this);
    layout->addWidget(viewport);

    setCentralWidget(centralContainer);
    setWindowTitle("ArchNative Studio");

    statusBar()->showMessage("Ready.");
}

MainWindow::~MainWindow()
{
}

void MainWindow::captureScreenshot(const QString &filename)
{
    // We need to allow the OpenGL widget to render at least one frame.
    // In a real app, we might wait for a signal, but for this test harness,
    // we force a repaint and grab.
    viewport->show();
    viewport->repaint();

    // Process pending events to ensure rendering commands are dispatched
    QApplication::processEvents();

    QImage screenshot = viewport->grabFramebuffer();
    screenshot.save(filename);
}

void MainWindow::runCameraTest()
{
    // Rotate camera programmatically
    if (viewport) {
        Camera* cam = viewport->getCamera();
        cam->rotate(45.0f, 0.0f); // Yaw 45 degrees
        viewport->repaint();
        QApplication::processEvents();
    }
}
