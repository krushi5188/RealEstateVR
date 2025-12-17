#ifndef CAMERA_H
#define CAMERA_H

#include <QVector3D>
#include <QMatrix4x4>
#include <QtMath>

class Camera
{
public:
    enum Mode {
        Orbit,  // "God View" - rotates around a target
        FirstPerson // "VR Walk" - rotates around self
    };

    Camera();

    void setMode(Mode mode);
    Mode getMode() const;

    // View & Projection
    QMatrix4x4 getViewMatrix() const;
    QMatrix4x4 getStereoViewMatrix(float offset) const; // Offset is +/- IPD/2
    QVector3D getPosition() const;
    QVector3D getForwardVector() const;

    // Manipulation
    void setPosition(const QVector3D &pos);
    void setTarget(const QVector3D &target); // For Orbit
    void setYawPitch(float yaw, float pitch); // For FPS

    // Input Handling
    void move(float dx, float dy, float dz); // Relative movement
    void rotate(float deltaYaw, float deltaPitch);
    void zoom(float amount); // Only for Orbit

private:
    Mode m_mode;
    QVector3D m_position;

    // Orbit Params
    QVector3D m_target;
    float m_distance;

    // FPS Params
    float m_yaw;
    float m_pitch;

    void updateVectors();
};

#endif // CAMERA_H
