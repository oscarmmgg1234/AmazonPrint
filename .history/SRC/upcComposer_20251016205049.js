const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const PT_PER_IN = 72;
const inToPt = (inches) => inches * PT_PER_IN;

/**
 * One page per label. Horizontal 2" x 1".
 * Name (small) at bottom-left, index (small) at top-left.
 * Barcode image uses the remaining area (max fit).
 */
async function generateUPCLabels(product, quantity, opts = {}) {
  if (!product || !product.name) throw new Error("product.name is required");
  if (!Number.isFinite(quantity) || quantity <= 0)
    throw new Error("quantity must be > 0");

  const {
    assetsSubdir = path.join("..", "ASSETS", "UPC-ZUMA"),
    outputFile = path.join("TEMP", "temp.pdf"),
    labelW_in = 2.0,
    labelH_in = 1.0,
    paddingPt = 6, // outer padding
    borderPt = 1,
    rounded = true,
    nameFontPt = 7,
    indexFontPt = 7,
    indexStart = 1, // starting index number
  } = opts;

  // resolve image path
  const assetsDir = path.join(__dirname, assetsSubdir);
  let imagePath = product.imagePath;
  if (!imagePath && product.imageFilename)
    imagePath = path.join(assetsDir, product.imageFilename);
  if (!imagePath && product.upc)
    imagePath = path.join(assetsDir, `${product.upc}.jpg`);
  if (!imagePath)
    throw new Error(
      "Provide product.upc, product.imageFilename, or product.imagePath"
    );

  // ensure output dir
  const outDir = path.dirname(path.join(__dirname, outputFile));
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const W = inToPt(labelW_in);
  const H = inToPt(labelH_in);

  // reserve tiny text margins (not full bands; we keep barcode big)
  const topTextPad = 10; // space under index
  const bottomTextPad = 12; // space above name

  const doc = new PDFDocument({ margin: 0, autoFirstPage: false });
  const out = fs.createWriteStream(path.join(__dirname, outputFile));
  doc.pipe(out);
  doc.registerFont("Sans", "Helvetica");

  for (let i = 0; i < quantity; i++) {
    doc.addPage({ size: [W, H], margin: 0 });

    // border
    doc.save().lineWidth(borderPt).strokeColor("black");
    if (rounded) {
      const r = Math.min(6, Math.min(W, H) / 10);
      doc
        .roundedRect(
          0.5 * borderPt,
          0.5 * borderPt,
          W - borderPt,
          H - borderPt,
          r
        )
        .stroke();
    } else {
      doc
        .rect(0.5 * borderPt, 0.5 * borderPt, W - borderPt, H - borderPt)
        .stroke();
    }
    doc.restore();

    // tiny texts
    // index – top-left
    doc.save().font("Sans").fontSize(indexFontPt).fillColor("black");
    doc.text(String(indexStart + i), paddingPt, paddingPt - 1, {
      width: 40,
      align: "left",
    });
    doc.restore();

    // name – bottom-left
    doc.save().font("Sans").fontSize(nameFontPt).fillColor("black");
    doc.text(product.name, paddingPt, H - paddingPt - nameFontPt - 1, {
      width: W - 2 * paddingPt,
      align: "left",
    });
    doc.restore();

    // barcode image area (maximizes size while respecting tiny text pads)
    const imgLeft = paddingPt;
    const imgTop = paddingPt + topTextPad; // leave space for index
    const imgW = W - 2 * paddingPt;
    const imgH = H - (paddingPt + topTextPad) - (paddingPt + bottomTextPad);

    try {
      // Let PDFKit keep aspect ratio and fill the available box (no image-size needed)
      doc.image(imagePath, imgLeft, imgTop, { fit: [imgW, imgH] });
    } catch {
      // red X if image unreadable
      doc.save().strokeColor("red");
      doc.moveTo(imgLeft, imgTop).lineTo(imgLeft + imgW, imgTop + imgH);
      doc.moveTo(imgLeft + imgW, imgTop).lineTo(imgLeft, imgTop + imgH);
      doc.stroke().restore();
    }
  }

  doc.end();
  await new Promise((resolve, reject) => {
    out.on("finish", resolve);
    out.on("error", reject);
  });
  return path.join(__dirname, outputFile);
}

module.exports = { generateUPCLabels };

/* Example:
(async () => {
  await generateUPCLabels(
    { name: "Sample Item", upc: "076351309811" }, // image at ../ASSETS/UPC-ZUMA/076351309811.jpg
    5,
    { indexStart: 1 }
  );
})();
*/
