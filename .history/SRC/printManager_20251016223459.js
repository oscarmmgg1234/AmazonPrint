const fs = require("fs/promises");
const path = require("path");
const { spawn } = require("child_process");
const { generateUPCLabels } = require("./upcComposer");

async function printUPCLabels(product, quantity, opts = {}) {
  const {
    sumatraPath = "C:\\Users\\PC\\AppData\\Local\\SumatraPDF\\SumatraPDF.exe",
  } = opts;

  const outputFile = path.join(__dirname, "TEMP", "temp.pdf");
  console.log("🧾 Generating PDF...");
  const pdfPath = await generateUPCLabels(product, quantity);

  try {
    await fs.access(pdfPath);
    console.log(`✅ PDF ready at: ${pdfPath}`);
  } catch {
    throw new Error("❌ PDF not found after generation");
  }

  console.log("🖨️ Printing to default printer...");

  await new Promise((resolve, reject) => {
    const args = [
      `-print-to "Rollo Printer"`,
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

  try {
    await fs.unlink(pdfPath);
    console.log("🧹 Temp PDF deleted.");
  } catch (err) {
    console.warn("⚠️ Could not delete temp file:", err.message);
  }

  return true;
}

exports.printUPCLabels = printUPCLabels;
