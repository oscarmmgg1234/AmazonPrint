const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

function inchesToPoints(inches) {
  return inches * 72;
}

/**
 * Generate a PDF where each label is its own page (2" x 1"), horizontal,
 * with a border, the UPC image, and the product name band.
 *
 * @param {{ name: string, upc?: string, imageFilename?: string, imagePath?: string }} product
 * @param {number} quantity
 * @returns {Promise<string>} output path
 */
async function generateUPCLabels(product, quantity) {
  if (!product || !product.name) throw new Error("product.name is required");
  if (!Number.isFinite(quantity) || quantity <= 0)
    throw new Error("quantity must be > 0");

  // Paths
  const assetsDir = path.join(__dirname, "..", "ASSETS", "UPC-ZUMA");
  const tempDir = path.join(__dirname, "TEMP");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  const outputPath = path.join(tempDir, "temp.pdf");

  // Resolve image
  let imagePath = product.imagePath;
  if (!imagePath && product.imageFilename)
    imagePath = path.join(assetsDir, product.imageFilename);
  if (!imagePath && product.upc)
    imagePath = path.join(assetsDir, `${product.upc}.jpg`);
  if (!imagePath)
    throw new Error(
      "Provide product.upc, product.imageFilename, or product.imagePath"
    );

  // Label dimensions — HORIZONTAL (2.00" W × 1.00" H)
  const labelWidth = inchesToPoints(2);
  const labelHeight = inchesToPoints(1);

  // Styling
  const paddingPt = 6;
  const nameBandPt = 14;
  const borderPt = 1;
  const rounded = true;

  // Prepare doc
  const doc = new PDFDocument({ margin: 0, autoFirstPage: false });
  const out = fs.createWriteStream(outputPath);
  doc.pipe(out);
  doc.registerFont("Sans", "Helvetica");

  for (let n = 0; n < quantity; n++) {
    // 👉 separate page per label
    doc.addPage({ size: [labelWidth, labelHeight], margin: 0 });

    // Border
    doc.save().lineWidth(borderPt).strokeColor("black");
    if (rounded) {
      const r = Math.min(6, Math.min(labelWidth, labelHeight) / 10);
      doc
        .roundedRect(
          0.5 * borderPt,
          0.5 * borderPt,
          labelWidth - borderPt,
          labelHeight - borderPt,
          r
        )
        .stroke();
    } else {
      doc
        .rect(
          0.5 * borderPt,
          0.5 * borderPt,
          labelWidth - borderPt,
          labelHeight - borderPt
        )
        .stroke();
    }
    doc.restore();

    // Image area (reserve bottom band for name)
    const imgLeft = paddingPt;
    const imgTop = paddingPt;
    const imgWidthAvail = labelWidth - 2 * paddingPt;
    const imgHeightAvail =
      labelHeight - 2 * paddingPt - (nameBandPt + paddingPt);

    try {
      // No need for image-size — let PDFKit scale it proportionally with 'fit'
      doc.image(imagePath, imgLeft, imgTop, {
        fit: [imgWidthAvail, imgHeightAvail],
      });
    } catch {
      // Red X if image path is wrong or unreadable
      doc.save().strokeColor("red");
      doc
        .moveTo(imgLeft, imgTop)
        .lineTo(imgLeft + imgWidthAvail, imgTop + imgHeightAvail)
        .moveTo(imgLeft + imgWidthAvail, imgTop)
        .lineTo(imgLeft, imgTop + imgHeightAvail)
        .stroke()
        .restore();
    }

    // Name band (bottom)
    const bandY = labelHeight - paddingPt - nameBandPt;
    doc.save().font("Sans").fontSize(9).fillColor("black");
    doc.text(product.name, paddingPt, bandY, {
      width: labelWidth - 2 * paddingPt,
      height: nameBandPt,
      align: "center",
      valign: "center",
    });
    doc.restore();
  }

  doc.end();
  await new Promise((res, rej) => {
    out.on("finish", res);
    out.on("error", rej);
  });

  return outputPath;
}

module.exports = { generateUPCLabels };
