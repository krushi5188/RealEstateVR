#include "Camera.h"

Camera::Camera()
    : m_mode(Orbit),
      m_position(0.0f, 10.0f, 20.0f),
      m_target(0.0f, 0.0f, 0.0f),
      m_distance(20.0f),
      m_yaw(-90.0f),
      m_pitch(-45.0f)
{
    updateVectors();
}

void Camera::setMode(Mode mode)
{
    m_mode = mode;
    if (m_mode == FirstPerson) {
        // When switching to FPS, we might want to capture current look direction
        // For now, reset or keep current
    }
}

Camera::Mode Camera::getMode() const
{
    return m_mode;
}

void Camera::setPosition(const QVector3D &pos)
{
    m_position = pos;
    // In Orbit mode, changing position might affect distance/target logic
    // Simplified for now
}

void Camera::setTarget(const QVector3D &target)
{
    m_target = target;
    m_distance = m_position.distanceToPoint(m_target);
}

void Camera::setYawPitch(float yaw, float pitch)
{
    m_yaw = yaw;
    m_pitch = pitch;

    // Constrain pitch
    if (m_pitch > 89.0f) m_pitch = 89.0f;
    if (m_pitch < -89.0f) m_pitch = -89.0f;

    updateVectors();
}

void Camera::move(float dx, float dy, float dz)
{
    if (m_mode == FirstPerson) {
        QVector3D forward = getForwardVector();
        QVector3D right = QVector3D::crossProduct(forward, QVector3D(0,1,0)).normalized();
        QVector3D up(0,1,0);

        m_position += right * dx;
        m_position += up * dy;
        m_position += forward * dz;
    } else {
        // Pan logic for Orbit (moves both target and position)
        // For now, unimplemented or simple
    }
}

void Camera::rotate(float deltaYaw, float deltaPitch)
{
    m_yaw += deltaYaw;
    m_pitch += deltaPitch;

    // Constrain pitch
    if (m_pitch > 89.0f) m_pitch = 89.0f;
    if (m_pitch < -89.0f) m_pitch = -89.0f;

    if (m_mode == Orbit) {
        // Recalculate position based on target + rotations
        float yawRad = qDegreesToRadians(m_yaw);
        float pitchRad = qDegreesToRadians(m_pitch);

        float x = m_distance * cos(pitchRad) * cos(yawRad);
        float y = m_distance * sin(pitchRad);
        float z = m_distance * cos(pitchRad) * sin(yawRad);

        m_position = m_target + QVector3D(x, y, z);
    }
    // In FPS mode, position stays, only vectors update (handled by getViewMatrix implicit usage of yaw/pitch)
}

void Camera::zoom(float amount)
{
    if (m_mode == Orbit) {
        m_distance -= amount;
        if (m_distance < 1.0f) m_distance = 1.0f;

        // Recalculate position
        rotate(0, 0);
    }
}

QMatrix4x4 Camera::getViewMatrix() const
{
    QMatrix4x4 view;
    if (m_mode == Orbit) {
        view.lookAt(m_position, m_target, QVector3D(0, 1, 0));
    } else {
        // FPS Mode: Look from position in direction of yaw/pitch
        QVector3D front;
        float yawRad = qDegreesToRadians(m_yaw);
        float pitchRad = qDegreesToRadians(m_pitch);

        front.setX(cos(yawRad) * cos(pitchRad));
        front.setY(sin(pitchRad));
        front.setZ(sin(yawRad) * cos(pitchRad));
        front.normalize();

        view.lookAt(m_position, m_position + front, QVector3D(0, 1, 0));
    }
    return view;
}

QMatrix4x4 Camera::getStereoViewMatrix(float offset) const
{
    QMatrix4x4 view;

    // Calculate Right Vector
    QVector3D forward = getForwardVector();
    QVector3D up(0, 1, 0);
    QVector3D right = QVector3D::crossProduct(forward, up).normalized();

    // Shift position by offset along Right vector
    QVector3D eyePos = m_position + (right * offset);

    if (m_mode == Orbit) {
        view.lookAt(eyePos, m_target, up);
    } else {
        // FPS
        view.lookAt(eyePos, eyePos + forward, up);
    }
    return view;
}

QVector3D Camera::getPosition() const
{
    return m_position;
}

QVector3D Camera::getForwardVector() const
{
    float yawRad = qDegreesToRadians(m_yaw);
    float pitchRad = qDegreesToRadians(m_pitch);
    QVector3D front;
    front.setX(cos(yawRad) * cos(pitchRad));
    front.setY(sin(pitchRad));
    front.setZ(sin(yawRad) * cos(pitchRad));
    return front.normalized();
}

void Camera::updateVectors()
{
    // Helper if needed to cache vectors
}
