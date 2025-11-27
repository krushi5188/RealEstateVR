#ifndef OPENXRMANAGER_H
#define OPENXRMANAGER_H

#define XR_USE_PLATFORM_XLIB
#define XR_USE_GRAPHICS_API_OPENGL
#include <vulkan/vulkan.h> // Needed for OpenXR headers sometimes, or just GL
#include <GL/glx.h>
#include <openxr/openxr.h>
#include <openxr/openxr_platform.h>
#include <iostream>

class OpenXRManager
{
public:
    OpenXRManager();
    ~OpenXRManager();

    bool initialize();
    void shutdown();

    // Drive the render loop
    void setViewport(class ViewportWidget* viewport);
    void update(); // Poll events, update pose
    void render(); // Submit frame

    bool isSessionRunning() const { return m_sessionRunning; }

private:
    class ViewportWidget* m_viewport = nullptr;
    XrInstance m_instance = XR_NULL_HANDLE;
    XrSystemId m_systemId = XR_NULL_SYSTEM_ID;
    XrSession m_session = XR_NULL_HANDLE;
    bool m_sessionRunning = false;

    bool checkLayers();
};

#endif // OPENXRMANAGER_H
