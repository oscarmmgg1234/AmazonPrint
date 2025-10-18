const fs = require("fs");
const PDFDocument = require("pdfkit");
const sizeOf = require("image-size");

function inchesToPoints(inches) {
  return inches * 72; // PDF points per inch
}

async function generateLabelPDF({
  labelWidthIn = 2,
  labelHeightIn = 1,
  labels = [],
  outputPath = "./labels.pdf",
}) {
  if (!labels.length) throw new Error("No labels provided.");

  const W = inchesToPoints(labelWidthIn);
  const H = inchesToPoints(labelHeightIn);

  const doc = new PDFDocument({ size: [W, H * labels.length], margin: 0 });
  doc.pipe(fs.createWriteStream(outputPath));

  labels.forEach((item, i) => {
    const y = i * H;

    // Border
    doc.rect(0, y, W, H).stroke();

    // Draw the PNG (centered)
    try {
      const { width, height } = sizeOf(item.img);
      const scale = Math.min((W - 16) / width, (H - 16) / height);
      const drawW = width * scale;
      const drawH = height * scale;
      const drawX = (W - drawW) / 2;
      const drawY = y + (H - drawH) / 2;
      doc.image(item.img, drawX, drawY, { width: drawW, height: drawH });
    } catch (err) {
      doc.fontSize(8).text("Image not found", 10, y + 10);
    }

    // Add label name below image
    if (item.name) {
      doc
        .fontSize(10)
        .text(item.name, 0, y + H - 14, { width: W, align: "center" });
    }
  });

  doc.end();
  console.log(`✅ PDF created: ${outputPath}`);
}

// Example usage
(async () => {
  await generateLabelPDF({
    labelWidthIn: 2.25,
    labelHeightIn: 1.25,
    labels: [
      { name: "Apple Gala", img: "./upcs/gala.png" },
      { name: "Banana", img: "./upcs/banana.png" },
      { name: "Orange Navel", img: "./upcs/orange.png" },
    ],
  });
})();
