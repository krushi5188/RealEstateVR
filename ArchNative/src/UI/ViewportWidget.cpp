#include "ViewportWidget.h"
#include <QOpenGLFunctions>

ViewportWidget::ViewportWidget(QWidget *parent)
    : QOpenGLWidget(parent)
{
}

ViewportWidget::~ViewportWidget()
{
}

void ViewportWidget::initializeGL()
{
    initializeOpenGLFunctions();
    glClearColor(0.2f, 0.2f, 0.2f, 1.0f); // Dark gray background
}

void ViewportWidget::resizeGL(int w, int h)
{
    glViewport(0, 0, w, h);
}

void ViewportWidget::paintGL()
{
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
    drawGrid();
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
