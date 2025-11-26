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
