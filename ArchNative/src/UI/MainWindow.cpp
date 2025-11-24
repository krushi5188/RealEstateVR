#include "MainWindow.h"
#include <QApplication>
#include <QScreen>
#include <QTimer>

MainWindow::MainWindow(QWidget *parent)
    : QMainWindow(parent)
{
    viewport = new ViewportWidget(this);
    setCentralWidget(viewport);
    setWindowTitle("ArchNative 1.0");
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
