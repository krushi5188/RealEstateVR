#include "OpenXRManager.h"
#include <vector>
#include <cstring>

OpenXRManager::OpenXRManager()
{
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

    // Simulate head turning left/right
    // float yaw = std::sin(time) * 0.5f;

    // We would pass this pose to the Camera via Viewport
    // For now, we assume Viewport handles its own Camera, we just trigger render.
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
