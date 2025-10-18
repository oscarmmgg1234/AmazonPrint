const fs = require("fs/promises");
const path = require("path");
const { spawn } = require("child_process");
const { generateUPCLabels } = require("./upcComposer");

async function printUPCLabels(product, quantity, opts = {}) {
  const printerName = opts.printerName || "Rollo Printer";

  // --- Generate the PDF ---
  const pdfPath = await generateUPCLabels(product, quantity);
  try {
    await fs.access(pdfPath);
  } catch {
    throw new Error("PDF not found after generation");
  }

  // --- Print via Windows Spooler using PowerShell ---
  await new Promise((resolve, reject) => {
    const psScript = `
      try {
        Start-Process -FilePath '${pdfPath}' -Verb PrintTo -ArgumentList '${printerName}';
        Start-Sleep -Milliseconds 500;
        exit 0
      } catch {
        Write-Error $_;
        exit 1
      }
    `;

    const child = spawn("powershell.exe", [
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy", "Bypass",
      "-Command", psScript
    ], {
      windowsHide: true
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(true);
      else reject(new Error(`PowerShell exited with code ${code}`));
    });
  });

  // Optionally delete after printing
  // try { await fs.unlink(pdfPath); } catch {}

  return true;
}

exports.printUPCLabels = printUPCLabels;
