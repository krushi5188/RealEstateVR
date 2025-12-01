#ifndef PDFCONVERTER_H
#define PDFCONVERTER_H

#include <string>

class PDFConverter
{
public:
    // Converts a PDF page to a PNG image.
    // Returns true on success.
    // pdfPath: Path to the source PDF.
    // outputImagePath: Path where the image should be saved (without extension, or logic handles it).
    static bool convertToImage(const std::string& pdfPath, const std::string& outputImagePath);
};

#endif // PDFCONVERTER_H
