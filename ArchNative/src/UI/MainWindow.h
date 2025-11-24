#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include "ViewportWidget.h"

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    MainWindow(QWidget *parent = nullptr);
    ~MainWindow();

    void captureScreenshot(const QString &filename);
    void runCameraTest();

private:
    ViewportWidget *viewport;
};

#endif // MAINWINDOW_H
