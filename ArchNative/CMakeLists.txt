cmake_minimum_required(VERSION 3.16)
project(ArchNative VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

find_package(Qt6 REQUIRED COMPONENTS Widgets OpenGLWidgets)
find_package(OpenCV REQUIRED)

find_package(PkgConfig REQUIRED)
pkg_check_modules(Tesseract REQUIRED tesseract)

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
)

target_link_libraries(ArchNative PRIVATE
    Qt6::Widgets
    Qt6::OpenGLWidgets
    ${OpenCV_LIBS}
    ${Tesseract_LIBRARIES}
)
target_include_directories(ArchNative PRIVATE ${Tesseract_INCLUDE_DIRS})

# Copy assets to build directory
add_custom_command(TARGET ArchNative POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/assets ${CMAKE_BINARY_DIR}/assets)
