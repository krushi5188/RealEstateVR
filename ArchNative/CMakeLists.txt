cmake_minimum_required(VERSION 3.16)
project(ArchNative VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

find_package(Qt6 REQUIRED COMPONENTS Widgets OpenGLWidgets PrintSupport)
find_package(OpenCV REQUIRED)

# Dependency Resolution (Hybrid: Config for Windows/Vcpkg, PkgConfig for Linux/Mac)
if(WIN32)
    find_package(Tesseract CONFIG REQUIRED)
    find_package(OpenXR CONFIG REQUIRED)
    # Define alias variables for consistency if needed, but usually we link targets directly
else()
    find_package(PkgConfig REQUIRED)
    pkg_check_modules(Tesseract REQUIRED tesseract)
    pkg_check_modules(OpenXR REQUIRED openxr)
endif()

add_executable(ArchNative MACOSX_BUNDLE
    src/main.cpp
    src/UI/MainWindow.cpp
    src/UI/MainWindow.h
    src/UI/ViewportWidget.cpp
    src/UI/ViewportWidget.h
    src/Core/Camera.cpp
    src/Core/Camera.h
    src/Core/ImageProcessor.cpp
    src/Core/ImageProcessor.h
    src/Core/Project.cpp
    src/Core/Project.h
    src/Core/Floor.h
    src/Core/MeshGenerator.cpp
    src/Core/MeshGenerator.h
    src/Core/Mesh.h
    src/Core/Serializer.cpp
    src/Core/Serializer.h
    src/Core/Sun.cpp
    src/Core/Sun.h
    src/Analysis/LightAnalyzer.cpp
    src/Analysis/LightAnalyzer.h
    src/Analysis/PathFinder.cpp
    src/Analysis/PathFinder.h
    src/Core/VirtualAgent.cpp
    src/Core/VirtualAgent.h
    src/Core/FurnitureLibrary.cpp
    src/Core/FurnitureLibrary.h
    src/Core/Furniture.h
    src/Analysis/AcousticAnalyzer.cpp
    src/Analysis/AcousticAnalyzer.h
    src/Analysis/BiophilicAnalyzer.cpp
    src/Analysis/BiophilicAnalyzer.h
    src/Analysis/CostEstimator.cpp
    src/Analysis/CostEstimator.h
    src/Analysis/BlueprintGenerator.cpp
    src/Analysis/BlueprintGenerator.h
    src/Core/OpenXRManager.cpp
    src/Core/OpenXRManager.h
    src/Core/PDFConverter.cpp
    src/Core/PDFConverter.h
)

# Link Libraries
target_link_libraries(ArchNative PRIVATE
    Qt6::Widgets
    Qt6::OpenGLWidgets
    Qt6::PrintSupport
    ${OpenCV_LIBS}
)

if(WIN32)
    # Vcpkg targets
    target_link_libraries(ArchNative ... OpenXR::openxr_loader)
else()
    # PkgConfig variables
    target_link_libraries(ArchNative PRIVATE ${Tesseract_LIBRARIES} ${OpenXR_LIBRARIES})
    target_include_directories(ArchNative PRIVATE ${Tesseract_INCLUDE_DIRS} ${OpenXR_INCLUDE_DIRS})
endif()


# Copy assets to build directory
add_custom_command(TARGET ArchNative POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/assets ${CMAKE_BINARY_DIR}/assets)
