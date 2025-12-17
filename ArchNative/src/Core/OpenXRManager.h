#ifndef OPENXRMANAGER_H
#define OPENXRMANAGER_H

#include <iostream>
#include "VRInput.h"

// Forward decls to avoid OpenXR/X11 headers in public API
struct XrInstance_T; typedef XrInstance_T* XrInstance;
struct XrSession_T; typedef XrSession_T* XrSession;
typedef uint64_t XrSystemId;

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

    const VRInputState& getInputState() const { return m_inputState; }

    bool isSessionRunning() const { return m_sessionRunning; }

private:
    void pollActions(); // Check controller inputs

    class ViewportWidget* m_viewport = nullptr;
    VRInputState m_inputState;

    // Use void* or forward declared types if possible, or just uintptr_t logic if we want to be strictly safe without any Xr types.
    // But using forward decls of Xr types usually works if we don't need their size.
    XrInstance m_instance = nullptr; // XR_NULL_HANDLE is 0
    XrSystemId m_systemId = 0;       // XR_NULL_SYSTEM_ID is 0
    XrSession m_session = nullptr;   // XR_NULL_HANDLE is 0
    bool m_sessionRunning = false;

    bool checkLayers();
};

#endif // OPENXRMANAGER_H
