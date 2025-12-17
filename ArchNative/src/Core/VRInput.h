#ifndef VRINPUT_H
#define VRINPUT_H

#include <opencv2/core/types.hpp> // For point/vec if needed, or just simple structs

struct VRControllerState {
    float x, y, z;       // Position
    float qx, qy, qz, qw;// Orientation
    bool selectPressed;  // Trigger/A button
    bool menuPressed;    // B/Menu button
    float thumbstickX;
    float thumbstickY;
};

struct VRInputState {
    VRControllerState leftHand;
    VRControllerState rightHand;
};

#endif // VRINPUT_H
