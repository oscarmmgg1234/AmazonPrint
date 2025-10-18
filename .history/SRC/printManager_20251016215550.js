const fs = require("fs/promises");
const path = require("path");
const { spawn } = require("child_process");
const { generateUPCLabels } = require("./upcComposer");

/**
 * Generate, print to default printer using SumatraPDF, then delete TEMP/temp.pdf.
 */
async function printUPCLabels(product, quantity, opts = {}) {
  const {
    sumatraPath = "C:\\Users\\PC\\AppData\\Local\\SumatraPDF\\SumatraPDF.exe",
  } = opts;

  // --- absolute output path ---
  const outputFile = path.join(__dirname, "TEMP", "temp.pdf");

  console.log("🧾 Generating PDF...");
  const pdfPath = await generateUPCLabels(product, quantity);

  // 1️⃣ Verify the file exists
  try {
    await fs.access(pdfPath);
    console.log(`✅ PDF ready at: ${pdfPath}`);
  } catch {
    throw new Error("❌ PDF not found after generation");
  }

  // 2️⃣ Print silently to default printer
  console.log("🖨️ Printing to default printer...");

  await new Promise((resolve, reject) => {
  const args = [
    `-print-to "Rollo Printer"`, // or use -print-to-default if you prefer
    `-print-settings "fit,center"`, // <-- key line: fit scales content, center aligns it
    "-silent",
    "-exit-when-done",
    `"${pdfPath}"`,
  ];


    console.log(`🧠 Command: "${sumatraPath}" ${args.join(" ")}`);

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



exports.printUPCLabels = printUPCLabels;
