#ifndef VIEWPORTWIDGET_H
#define VIEWPORTWIDGET_H

#include <QOpenGLWidget>
#include <QOpenGLFunctions>
#include <QMouseEvent>
#include <QKeyEvent>
#include "../Core/Camera.h"
#include "../Core/Mesh.h"

class ViewportWidget : public QOpenGLWidget, protected QOpenGLFunctions
{
    Q_OBJECT

public:
    ViewportWidget(QWidget *parent = nullptr);
    ~ViewportWidget();

    Camera* getCamera() { return &m_camera; }
    void setMesh(const Mesh& mesh); // To receive geometry

protected:
    void initializeGL() override;
    void resizeGL(int w, int h) override;
    void paintGL() override;

    // Input Events
    void mousePressEvent(QMouseEvent *event) override;
    void mouseMoveEvent(QMouseEvent *event) override;
    void wheelEvent(QWheelEvent *event) override;

private:
    void drawGrid();
    void drawMesh(); // New render function

    Camera m_camera;
    QPoint m_lastMousePos;
    QMatrix4x4 m_projection;
    Mesh m_mesh; // Stored mesh data
};

#endif // VIEWPORTWIDGET_H
