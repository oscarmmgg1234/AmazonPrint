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
    // ⚙️ Show print dialog instead of silent printing
    const args = [
      "-print-dialog", // show dialog before printing
      "-exit-when-done", // auto-close Sumatra when finished
      `"${pdfPath}"`, // path to the generated PDF
    ];

    const child = spawn(sumatraPath, args, {
      shell: true,
      windowsHide: false, // important: allow dialog visibility
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(true);
      else reject(new Error(`SumatraPDF exited with code ${code}`));
    });
  });

  // Optional cleanup (disabled for debugging)
  // try { await fs.unlink(pdfPath); } catch {}

  return true;
}

exports.printUPCLabels = printUPCLabels;
