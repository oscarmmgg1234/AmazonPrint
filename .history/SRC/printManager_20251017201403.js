const fs = require("fs/promises");
const path = require("path");
const { spawn } = require("child_process");
const { generateUPCLabels } = require("./upcComposer");

async function printUPCLabels(product, quantity, opts = {}) {
  const {
    sumatraPath = "C:\\Users\\PC\\AppData\\Local\\SumatraPDF\\SumatraPDF.exe",
  } = opts;

  const outputFile = path.join(__dirname, "TEMP", "temp.pdf");
  const pdfPath = await generateUPCLabels(product, quantity);

  try {
    await fs.access(pdfPath);
  } catch {
    throw new Error("PDF not found after generation");
  }

  await new Promise((resolve, reject) => {
    const args = [
      `-print-to "Rollo Printer"`,
      `-print-settings "noscale,paper=My Custom "`,
      "-silent",
      "-exit-when-done",
      `"${pdfPath}"`,
    ];

    const child = spawn(sumatraPath, args, {
      shell: true,
      windowsHide: true,
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(true);
      else reject(new Error(`SumatraPDF exited with code ${code}`));
    });
  });

  try {
    // await fs.unlink(pdfPath);
  } catch {}
  return true;
}

exports.printUPCLabels = printUPCLabels;
