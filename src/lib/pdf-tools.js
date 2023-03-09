import { readFile } from "fs"
import PdfPrinter from "pdfmake"
import { pipeline } from "stream" // CORE PACKAGE
import { promisify } from "util" // CORE PACKAGE
import { getPDFWritableStream } from "./fs-tools.js"

export const getPDFReadableStream = book => {
  // Define font files
  const fonts = {
    Helvetica: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  }
  const printer = new PdfPrinter(fonts)

  const docDefinition = {
    content: [book.title, book.category],
    defaultStyle: {
      font: "Helvetica",
    },
  }

  const pdfReadableStream = printer.createPdfKitDocument(docDefinition, {})
  pdfReadableStream.end()

  return pdfReadableStream
}

export const asyncPDFGeneration = async book => {
  // normally pipeline function works with callbacks to tell us when the stream is ended, we shall avoid using callbacks and in particular mixing them with Promises
  // pipeline(source, destination, err => {}) <-- "BAD" (callback based pipeline)
  // await pipeline(source, destination) <-- GOOD (Promise based pipeline)

  // Promisify is a (very cool) tool which turns a callback based function (err first callback) into a promise based function
  // Since pipeline is an error first callback based function --> we can turn pipeline into a promise based pipeline

  const source = getPDFReadableStream(book)
  const destination = getPDFWritableStream("test.pdf")

  const promiseBasedPipeline = promisify(pipeline)

  await promiseBasedPipeline(source, destination)
}
