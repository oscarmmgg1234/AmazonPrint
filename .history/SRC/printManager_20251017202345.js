const fs = require("fs/promises");
const path = require("path");
const { spawn } = require("child_process");
const { generateUPCLabels } = require("./upcComposer");

async function printUPCLabels(product, quantity, opts = {}) {
  const printerName = opts.printerName || "Rollo Printer";

  // 1️⃣ Generate PDF
  const pdfPath = await generateUPCLabels(product, quantity);
  try {
    await fs.access(pdfPath);
  } catch {
    throw new Error("PDF not found after generation");
  }

  // 2️⃣ PowerShell command: print directly through spooler
  await new Promise((resolve, reject) => {
    // Convert backslashes to forward slashes for PowerShell compatibility
    const safePdfPath = pdfPath.replace(/\\/g, "/");
    const safePrinter = printerName.replace(/"/g, '\\"');

    const psScript = `
      try {
        $file = "${safePdfPath}"
        $printer = "${safePrinter}"
        $p = Get-Printer -Name $printer -ErrorAction SilentlyContinue
        if (-not $p) {
          Write-Error "Printer '$printer' not found"
          exit 2
        }
        Start-Process -FilePath $file -Verb PrintTo -ArgumentList $printer
        Start-Sleep -Milliseconds 500
        exit 0
      } catch {
        Write-Error $_
        exit 1
      }
    `;

    const child = spawn(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-ExecutionPolicy",
        "Bypass",
        "-Command",
        psScript,
      ],
      { windowsHide: true }
    );

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(true);
      else reject(new Error(`PowerShell exited with code ${code}`));
    });
  });

  // 3️⃣ (Optional) Clean up PDF after print
  // try { await fs.unlink(pdfPath); } catch {}

  return true;
}

exports.printUPCLabels = printUPCLabels;
