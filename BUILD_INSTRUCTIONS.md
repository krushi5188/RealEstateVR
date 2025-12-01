# ArchNative Build Instructions

## Prerequisites

To build ArchNative for Windows (.exe) or macOS (.dmg), you need the following tools installed on your host machine.

### General (Cross-Platform)
*   **CMake 3.16+**: Build system generator.
*   **Qt 6.4+**: GUI framework. Install `Qt 6` via the Qt Online Installer. Ensure `Qt Widgets`, `Qt OpenGLWidgets`, and `Qt PrintSupport` modules are selected.
*   **OpenCV 4.x**: Computer Vision library.
*   **Tesseract 5.x**: OCR library.
*   **OpenXR SDK**: For AR/VR support.

---

## 1. Windows Build (.exe)

**Requirements:**
*   Visual Studio 2022 (with C++ Desktop Development workload)
*   Qt 6 for Windows (MSVC 2019/2022 64-bit)
*   OpenCV for Windows (Pre-built binaries recommended)
*   Tesseract for Windows (via vcpkg or pre-built)

**Steps:**
1.  Open **CMake GUI**.
2.  Set source code to `path/to/ArchNative`.
3.  Set build binaries to `path/to/ArchNative/build`.
4.  Click **Configure**. Select `Visual Studio 17 2022` and `x64`.
5.  If CMake complains about missing packages, set the following variables:
    *   `Qt6_DIR`: `C:/Qt/6.x.x/msvc2019_64/lib/cmake/Qt6`
    *   `OpenCV_DIR`: `C:/opencv/build`
    *   `Tesseract_DIR` or `PkgConfig` paths.
6.  Click **Generate** then **Open Project**.
7.  In Visual Studio, switch to **Release** configuration.
8.  Build Solution (`Ctrl+Shift+B`).
9.  **Packaging**: Run `windeployqt.exe` on the generated `ArchNative.exe` to copy necessary Qt DLLs to the folder.
    ```powershell
    C:/Qt/6.x.x/msvc2019_64/bin/windeployqt.exe Release/ArchNative.exe
    ```
10. Zip the folder or use an installer generator (NSIS/Inno Setup).

---

## 2. macOS Build (.dmg)

**Requirements:**
*   Xcode (latest)
*   Qt 6 for macOS (via Online Installer or Homebrew: `brew install qt@6`)
*   Dependencies via Homebrew:
    ```bash
    brew install opencv tesseract cmake openxr
    ```

**Steps:**
1.  Open Terminal.
2.  Navigate to `ArchNative` directory.
3.  Generate Xcode project:
    ```bash
    mkdir build && cd build
    cmake .. -G Xcode -DCMAKE_PREFIX_PATH="/usr/local/opt/qt@6"
    ```
4.  Build:
    ```bash
    cmake --build . --config Release
    ```
5.  **Packaging**: Use `macdeployqt` to create the `.dmg`.
    ```bash
    /usr/local/opt/qt@6/bin/macdeployqt ArchNative.app -dmg
    ```
6.  You will find `ArchNative.dmg` in the build directory.

---

## 3. Linux Build

**Requirements:**
*   `build-essential`, `cmake`, `qt6-base-dev`, `libopencv-dev`, `libtesseract-dev`, `libopenxr-dev`

**Steps:**
```bash
mkdir build && cd build
cmake ..
make -j$(nproc)
./ArchNative
```
