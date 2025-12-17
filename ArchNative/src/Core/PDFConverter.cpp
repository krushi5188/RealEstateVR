#include "PDFConverter.h"
#include <iostream>
#include <filesystem>
#include <QProcess>
#include <QStringList>

bool PDFConverter::convertToImage(const std::string& pdfPath, const std::string& outputImagePath)
{
    // Use QProcess for cross-platform execution (Handles arguments on Windows vs Linux correctly)
    // We use 'pdftoppm' from poppler-utils

    // Remove .png if present in output path to get the prefix required by pdftoppm
    std::string prefix = outputImagePath;
    if (prefix.size() > 4 && prefix.substr(prefix.size() - 4) == ".png") {
        prefix = prefix.substr(0, prefix.size() - 4);
    }

    QString program = "pdftoppm";
    QStringList arguments;
    arguments << "-png" << "-singlefile" << QString::fromStdString(pdfPath) << QString::fromStdString(prefix);

    QProcess process;
    process.start(program, arguments);

    // Wait for it to finish (blocking)
    if (!process.waitForFinished(10000)) { // 10s timeout
        std::cerr << "PDF Conversion timed out or failed to start." << std::endl;
        return false;
    }

    if (process.exitCode() == 0) {
        // Verify file exists
        if (std::filesystem::exists(prefix + ".png")) {
            return true;
        }
    }

    std::cerr << "PDF Conversion failed: " << process.readAllStandardError().toStdString() << std::endl;
    return false;
}
