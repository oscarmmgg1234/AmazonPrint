const fs = require("fs/promises");
const path = require("path");
const { print } = require("pdf-to-printer");
const { generateUPCLabels } = require("./upcComposer");

async function printUPCLabels(product, quantity, opts = {}) {
  const printerName = opts.printerName || "Rollo Printer";

  // 1️⃣ Generate the PDF
  const pdfPath = await generateUPCLabels(product, quantity);
  try {
    await fs.access(pdfPath);
  } catch {
    throw new Error("PDF not found after generation");
  }

  // 2️⃣ Print directly through the system spooler (no Sumatra)
  await print(pdfPath, {
    printer: printerName,
    scale: "fit", // fit-to-printable-area (like browser “fit”)
    paperSize: "Custom.2x1in", // match your Rollo form
    silent: true, // suppress system dialogs
  });

  // 3️⃣ Optional cleanup
  // try { await fs.unlink(pdfPath); } catch {}

  return true;
}

exports.printUPCLabels = printUPCLabels;
