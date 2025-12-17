#include "ViewportWidget.h"
#include <QOpenGLFunctions>

ViewportWidget::ViewportWidget(QWidget *parent)
    : QOpenGLWidget(parent)
{
    setFocusPolicy(Qt::StrongFocus); // Enable keyboard events
}

ViewportWidget::~ViewportWidget()
{
}

void ViewportWidget::initializeGL()
{
    initializeOpenGLFunctions();
    glClearColor(0.2f, 0.2f, 0.2f, 1.0f); // Dark gray background
    glEnable(GL_DEPTH_TEST);
}

void ViewportWidget::setStereoMode(bool enabled)
{
    m_stereoMode = enabled;
    update();
}

void ViewportWidget::resizeGL(int w, int h)
{
    // If stereo, aspect ratio is effectively doubled (half width per eye)
    // But we set projection dynamically in paintGL usually for VR.
    // Here, let's just keep standard full window aspect for monoscopic default.
    glViewport(0, 0, w, h);

    float aspect = float(w) / float(h ? h : 1);
    m_projection.setToIdentity();
    m_projection.perspective(45.0f, aspect, 0.1f, 1000.0f);
}

void ViewportWidget::paintGL()
{
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    if (m_stereoMode) {
        int w = width();
        int h = height();
        int halfW = w / 2;
        float aspect = float(halfW) / float(h ? h : 1);

        QMatrix4x4 stereoProj;
        stereoProj.perspective(45.0f, aspect, 0.1f, 1000.0f);

        glMatrixMode(GL_PROJECTION);
        glLoadMatrixf(stereoProj.constData());

        // Left Eye
        glViewport(0, 0, halfW, h);
        glMatrixMode(GL_MODELVIEW);
        glLoadMatrixf(m_camera.getStereoViewMatrix(-0.5f).constData()); // -0.5 Offset
        if (!m_mesh.vertices.empty()) drawMesh(); else drawGrid();

        // Right Eye
        glViewport(halfW, 0, halfW, h);
        glMatrixMode(GL_MODELVIEW);
        glLoadMatrixf(m_camera.getStereoViewMatrix(0.5f).constData()); // +0.5 Offset
        if (!m_mesh.vertices.empty()) drawMesh(); else drawGrid();

    } else {
        // Monoscopic
        glViewport(0, 0, width(), height());
        glMatrixMode(GL_PROJECTION);
        glLoadMatrixf(m_projection.constData());

        glMatrixMode(GL_MODELVIEW);
        glLoadMatrixf(m_camera.getViewMatrix().constData());

        if (!m_mesh.vertices.empty()) {
            drawMesh();
        } else {
            drawGrid();
        }
    }
}

void ViewportWidget::setMesh(const Mesh& mesh)
{
    m_mesh = mesh;
    update(); // Request redraw
}

void ViewportWidget::drawMesh()
{
    // Simple immediate mode rendering for Phase 3N
    // In Phase 6N (OpenXR), we will migrate to VBOs
    glBegin(GL_TRIANGLES);
    for (unsigned int idx : m_mesh.indices) {
        if (idx < m_mesh.vertices.size()) {
            const auto& v = m_mesh.vertices[idx];
            glNormal3f(v.nx, v.ny, v.nz);
            // Simple lighting visualization: Color based on Normal
            glColor3f(0.5f + v.nx*0.5f, 0.5f + v.ny*0.5f, 0.5f + v.nz*0.5f);
            glVertex3f(v.x, v.y, v.z);
        }
    }
    glEnd();
}

void ViewportWidget::mousePressEvent(QMouseEvent *event)
{
    m_lastMousePos = event->pos();
}

void ViewportWidget::mouseMoveEvent(QMouseEvent *event)
{
    int dx = event->pos().x() - m_lastMousePos.x();
    int dy = event->pos().y() - m_lastMousePos.y();

    if (event->buttons() & Qt::RightButton) {
        // Orbit Rotate
        m_camera.rotate(-dx * 0.5f, -dy * 0.5f);
        update();
    }

    m_lastMousePos = event->pos();
}

void ViewportWidget::wheelEvent(QWheelEvent *event)
{
    float delta = event->angleDelta().y() * 0.01f;
    m_camera.zoom(delta);
    update();
}

void ViewportWidget::drawGrid()
{
    // Simple legacy OpenGL grid for demonstration/verification
    // In a modern Core Profile app, we would use VBOs/VAOs and Shaders.
    // For Phase 1N foundation verification, immediate mode or simple display lists
    // are often easier to debug quickly if the context allows (Compatibility Profile).
    // However, Qt 6 default is usually Core. Let's use basic raw GL commands
    // that are generally widely supported or safe defaults for a "Hello World" rect.

    // Draw a simple white triangle to verify rendering
    glBegin(GL_TRIANGLES);
        glColor3f(1.0f, 0.0f, 0.0f); // Red
        glVertex3f(-0.5f, -0.5f, 0.0f);
        glColor3f(0.0f, 1.0f, 0.0f); // Green
        glVertex3f(0.5f, -0.5f, 0.0f);
        glColor3f(0.0f, 0.0f, 1.0f); // Blue
        glVertex3f(0.0f, 0.5f, 0.0f);
    glEnd();
}
