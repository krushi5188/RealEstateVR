#include "../UI/ViewportWidget.h" // Include Qt headers FIRST

// Define OpenXR platforms
#ifdef __ANDROID__
    #define XR_USE_PLATFORM_ANDROID
    #define XR_USE_GRAPHICS_API_OPENGL_ES
    #include <EGL/egl.h>
    #include <GLES3/gl3.h>
    #include <jni.h>
#else
    // Linux Desktop
    #define XR_USE_PLATFORM_XLIB
    #define XR_USE_GRAPHICS_API_OPENGL
    #include <vulkan/vulkan.h>
    #include <GL/glx.h>
#endif

// Include OpenXR headers
#include <openxr/openxr.h>
#include <openxr/openxr_platform.h>

// Include our header last
#include "OpenXRManager.h"

#include <vector>
#include <cstring>
#include <cmath>

OpenXRManager::OpenXRManager()
{
    // Init input state
    m_inputState.leftHand = {0,0,0, 0,0,0,1, false, false, 0,0};
    m_inputState.rightHand = {0,0,0, 0,0,0,1, false, false, 0,0};
}

OpenXRManager::~OpenXRManager()
{
    shutdown();
}

bool OpenXRManager::initialize()
{
    std::cout << "Initializing OpenXR..." << std::endl;

    // 1. Create Instance
    XrInstanceCreateInfo createInfo = {XR_TYPE_INSTANCE_CREATE_INFO};
    strcpy(createInfo.applicationInfo.applicationName, "ArchNative");
    createInfo.applicationInfo.applicationVersion = 1;
    strcpy(createInfo.applicationInfo.engineName, "ArchNativeEngine");
    createInfo.applicationInfo.engineVersion = 1;
    createInfo.applicationInfo.apiVersion = XR_CURRENT_API_VERSION;

    // Enable generic layers if available
    const char* layers[] = {"XR_APILAYER_LUNARG_core_validation"};
    // Ideally check if available: checkLayers();
    // For this prototype, we skip layers to ensure it runs/fails gracefully on loader.
    createInfo.enabledApiLayerCount = 0;
    createInfo.enabledExtensionCount = 0;

    XrResult result = xrCreateInstance(&createInfo, &m_instance);
    if (XR_FAILED(result)) {
        std::cerr << "OpenXR: Failed to create instance (Error " << result << "). Is a runtime installed?" << std::endl;
        return false;
    }

    std::cout << "OpenXR Instance Created." << std::endl;

    // 2. Get System
    XrSystemGetInfo systemInfo = {XR_TYPE_SYSTEM_GET_INFO};
    systemInfo.formFactor = XR_FORM_FACTOR_HEAD_MOUNTED_DISPLAY;

    result = xrGetSystem(m_instance, &systemInfo, &m_systemId);
    if (XR_FAILED(result)) {
        std::cerr << "OpenXR: Failed to get system (Headset not found?)" << std::endl;
        // This is expected in headless
        return false;
    }

    std::cout << "OpenXR System Found (ID: " << m_systemId << ")" << std::endl;
    return true;
}

void OpenXRManager::setViewport(ViewportWidget* viewport)
{
    m_viewport = viewport;
}

void OpenXRManager::update()
{
    // 1. Poll OpenXR Events
    // In a real app: xrPollEvent...

    // 2. Locate Views (Head Pose)
    // Stub: Simulate head movement
    static float time = 0.0f;
    time += 0.016f; // 60fps

    pollActions();

    // 3. Handle Input
    // If "Select" is pressed on Right hand, Teleport!
    if (m_inputState.rightHand.selectPressed) {
        if (m_viewport) {
            Camera* cam = m_viewport->getCamera();
            // Teleport 1 meter forward
            // In real app, we'd raycast from controller.
            // Here we just jump to prove the link works.
            QVector3D current = cam->getPosition();
            cam->setPosition(current + QVector3D(0, 0, -1.0f));
            std::cout << "Teleport Triggered! New Pos: " << current.z() - 1.0f << std::endl;
        }
    }
}

void OpenXRManager::pollActions()
{
    // Simulate Input
    static int frameCount = 0;
    frameCount++;

    // Simulate "Select" press on frame 5
    if (frameCount == 5) {
        m_inputState.rightHand.selectPressed = true;
    } else {
        m_inputState.rightHand.selectPressed = false;
    }
}

void OpenXRManager::render()
{
    // 1. WaitFrame
    // 2. BeginFrame
    // 3. Render to Swapchain Image

    if (m_viewport) {
        // In a real OpenXR app, we render into the XrSwapchainImage.
        // For this Phase 6N prototype, we tell the Viewport to draw Stereo.
        // Ideally, we bind the FBO here.

        // Simulate render call
        // m_viewport->setStereoMode(true);
        // m_viewport->repaint();
        // But repaint() is async in Qt usually. We might need direct draw or just trust the loop.
    }

    // 4. EndFrame
}

void OpenXRManager::shutdown()
{
    if (m_session != XR_NULL_HANDLE) {
        xrDestroySession(m_session);
        m_session = XR_NULL_HANDLE;
    }
    if (m_instance != XR_NULL_HANDLE) {
        xrDestroyInstance(m_instance);
        m_instance = XR_NULL_HANDLE;
    }
}

bool OpenXRManager::checkLayers()
{
    // Todo: enumerate layers
    return true;
}
