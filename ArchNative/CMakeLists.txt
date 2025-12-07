cmake_minimum_required(VERSION 3.16)
project(ArchNative VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

# Silence macOS OpenGL deprecation warnings
if(APPLE)
    add_compile_definitions(GL_SILENCE_DEPRECATION)
endif()

find_package(Qt6 REQUIRED COMPONENTS Widgets OpenGLWidgets PrintSupport)
find_package(OpenCV REQUIRED)

# Dependency Resolution (Hybrid: Config for Windows/Mac(Vcpkg), PkgConfig for Linux)
if(WIN32 OR APPLE)
    # Windows and macOS (via Vcpkg) use CONFIG mode
    find_package(OpenXR CONFIG REQUIRED)

    if(WIN32)
        find_package(Tesseract CONFIG REQUIRED)
    else() # APPLE
        find_package(PkgConfig REQUIRED)
        pkg_check_modules(Tesseract REQUIRED tesseract)
    endif()

else()
    # Linux (Standard PkgConfig)
    find_package(PkgConfig REQUIRED)
    pkg_check_modules(Tesseract REQUIRED tesseract)
    pkg_check_modules(OpenXR REQUIRED openxr)
endif()

# macOS Bundle Properties (Ensures valid Info.plist)
set_target_properties(ArchNative PROPERTIES
    MACOSX_BUNDLE TRUE
    MACOSX_BUNDLE_GUI_IDENTIFIER "com.archnative.app"
    MACOSX_BUNDLE_BUNDLE_NAME "ArchNative"
    MACOSX_BUNDLE_BUNDLE_VERSION "1.0"
    MACOSX_BUNDLE_SHORT_VERSION_STRING "1.0"
    MACOSX_BUNDLE_INFO_PLIST "${CMAKE_CURRENT_SOURCE_DIR}/Info.plist.in"
)

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

if(WIN32 OR APPLE)
    # Vcpkg targets (OpenXR)
    if(TARGET OpenXR::openxr_loader)
        target_link_libraries(ArchNative PRIVATE OpenXR::openxr_loader)
    elseif(TARGET OpenXR::OpenXR)
        target_link_libraries(ArchNative PRIVATE OpenXR::OpenXR)
    else()
         message(WARNING "Neither OpenXR::openxr_loader nor OpenXR::OpenXR found. Attempting legacy link.")
         target_link_libraries(ArchNative PRIVATE openxr_loader)
    endif()

    # Tesseract linkage
    if(WIN32)
        target_link_libraries(ArchNative PRIVATE Tesseract::libtesseract)
    else() # APPLE
        target_link_libraries(ArchNative PRIVATE ${Tesseract_LIBRARIES})
        target_include_directories(ArchNative PRIVATE ${Tesseract_INCLUDE_DIRS})
    endif()

else()
    # Linux (PkgConfig)
    target_link_libraries(ArchNative PRIVATE ${Tesseract_LIBRARIES} ${OpenXR_LIBRARIES})
    target_include_directories(ArchNative PRIVATE ${Tesseract_INCLUDE_DIRS} ${OpenXR_INCLUDE_DIRS})
endif()


# Install instruction to create bundle structure
install(TARGETS ArchNative
    BUNDLE DESTINATION .
    RUNTIME DESTINATION bin
)

# Copy assets to build directory
add_custom_command(TARGET ArchNative POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
    ${CMAKE_SOURCE_DIR}/assets ${CMAKE_BINARY_DIR}/assets)
