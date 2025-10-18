const fs = require("fs/promises");
const path = require("path");
const { spawn } = require("child_process");
const { generateUPCLabels } = require("./upcComposer");

async function generateTestPrintPDF(product, quantity, opts = {}) {
  const {
    sumatraPath = "C:\\Users\\PC\\AppData\\Local\\SumatraPDF\\SumatraPDF.exe",
    outputPDF = path.join(__dirname, "TEMP", "print_test_output.pdf"),
  } = opts;

  const pdfPath = await generateUPCLabels(product, quantity);

  try {
    await fs.access(pdfPath);
  } catch {
    throw new Error("PDF not found after generation");
  }

  // 💡 This prints to Microsoft PDF printer instead of physical label printer
  await new Promise((resolve, reject) => {
    const args = [
      `-print-to "Microsoft Print to PDF"`,
      `-print-settings "fit"`,
      `-exit-when-done`,
      `"${pdfPath}"`,
    ];

    const child = spawn(sumatraPath, args, {
      shell: true,
      windowsHide: false,
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(true);
      else reject(new Error(`SumatraPDF exited with code ${code}`));
    });
  });

  return outputPDF;
}

exports.generateTestPrintPDF = generateTestPrintPDF;
