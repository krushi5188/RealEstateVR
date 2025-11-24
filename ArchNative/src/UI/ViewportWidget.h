#ifndef VIEWPORTWIDGET_H
#define VIEWPORTWIDGET_H

#include <QOpenGLWidget>
#include <QOpenGLFunctions>

class ViewportWidget : public QOpenGLWidget, protected QOpenGLFunctions
{
    Q_OBJECT

public:
    ViewportWidget(QWidget *parent = nullptr);
    ~ViewportWidget();

protected:
    void initializeGL() override;
    void resizeGL(int w, int h) override;
    void paintGL() override;

private:
    void drawGrid();
};

#endif // VIEWPORTWIDGET_H
