import Foundation
import PDFKit
import Vision
import AppKit

func renderPage(_ page: PDFPage, scale: CGFloat = 2.0) -> CGImage? {
    let pageRect = page.bounds(for: .mediaBox)
    let width = Int(pageRect.width * scale)
    let height = Int(pageRect.height * scale)
    let colorSpace = CGColorSpaceCreateDeviceRGB()

    guard let context = CGContext(
        data: nil,
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: 0,
        space: colorSpace,
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    ) else {
        return nil
    }

    context.setFillColor(NSColor.white.cgColor)
    context.fill(CGRect(x: 0, y: 0, width: width, height: height))
    context.saveGState()
    context.scaleBy(x: scale, y: scale)
    page.draw(with: .mediaBox, to: context)
    context.restoreGState()
    return context.makeImage()
}

func recognizeText(from cgImage: CGImage) throws -> [String] {
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = false
    request.recognitionLanguages = ["sv-SE", "en-US"]

    let handler = VNImageRequestHandler(cgImage: cgImage, options: [:])
    try handler.perform([request])

    let observations = request.results ?? []
    return observations.compactMap { $0.topCandidates(1).first?.string }
}

guard CommandLine.arguments.count > 1 else {
    fputs("Missing PDF path\n", stderr)
    exit(1)
}

let pdfPath = CommandLine.arguments[1]
let pdfURL = URL(fileURLWithPath: pdfPath)

guard let document = PDFDocument(url: pdfURL) else {
    fputs("Could not open PDF\n", stderr)
    exit(1)
}

var pageTexts: [[String: Any]] = []

for pageIndex in 0..<document.pageCount {
    guard let page = document.page(at: pageIndex) else { continue }
    guard let cgImage = renderPage(page) else { continue }

    do {
        let lines = try recognizeText(from: cgImage)
        pageTexts.append([
            "page": pageIndex + 1,
            "text": lines.joined(separator: "\n")
        ])
    } catch {
        fputs("OCR failed on page \(pageIndex + 1): \(error)\n", stderr)
        exit(1)
    }
}

let payload: [String: Any] = [
    "pages": pageTexts
]

let data = try JSONSerialization.data(withJSONObject: payload, options: [])
if let json = String(data: data, encoding: .utf8) {
    print(json)
}
