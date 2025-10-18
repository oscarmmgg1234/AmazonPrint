const fs = require("fs/promises");
const path = require("path");
const { spawn } = require("child_process");
const { generateUPCLabels } = require("./upcComposer");

/**
 * Generate, silently print, and then delete TEMP/temp.pdf using SumatraPDF.
 */
async function printUPCLabels(product, quantity, opts = {}) {
  const {
    printerName = "Rollo Printer",
    sumatraPath = "C:\\Users\\PC\\AppData\\Local\\SumatraPDF\\SumatraPDF.exe",
  } = opts;

  // --- absolute output path ---
  const outputFile = path.join(__dirname, "TEMP", "temp.pdf");

  console.log("🧾 Generating PDF...");
  const pdfPath = await generateUPCLabels(product, quantity, { outputFile });

  // 1️⃣ Verify the file exists
  try {
    await fs.access(pdfPath);
    console.log(`✅ PDF ready at: ${pdfPath}`);
  } catch {
    throw new Error("❌ PDF not found after generation");
  }

  // 2️⃣ Print silently using SumatraPDF
  console.log(`🖨️ Printing on ${printerName}...`);

  await new Promise((resolve, reject) => {
    const args = [
      "-print-to",
      printerName,
      "-silent",
      "-exit-when-done",
      pdfPath,
    ];

    const child = spawn(sumatraPath, args, {
      shell: true,
      windowsHide: true,
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        console.log("✅ Printed successfully.");
        resolve(true);
      } else {
        reject(new Error(`SumatraPDF exited with code ${code}`));
      }
    });
  });

  // 3️⃣ Delete the PDF after printing
  try {
    await fs.unlink(pdfPath);
    console.log("🧹 Temp PDF deleted.");
  } catch (err) {
    console.warn("⚠️ Could not delete temp file:", err.message);
  }

  return true;
}

// Example usage

exports.printUPCLabels = {printUPCLabels};
