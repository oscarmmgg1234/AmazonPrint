// label-upc.js (Node/CommonJS)
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const PT_PER_IN = 72;
const inToPt = (inches) => inches * PT_PER_IN;

/**
 * One page per label. Horizontal 2" x 1".
 * Index = top-left (small), Name = top-right (small).
 * Barcode image uses full width under a tiny top band.
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
    topBandPt = 12, // reserved height for the top text band
    indexStart = 1,
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
  const outPath = path.join(__dirname, outputFile);
  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const W = inToPt(labelW_in);
  const H = inToPt(labelH_in);

  // Image box: full width, height is whatever remains under the top band
  const imgLeft = paddingPt;
  const imgTop = paddingPt + topBandPt; // leave room for index+name
  const imgW = W - 2 * paddingPt;
  const imgH = H - imgTop - paddingPt; // to bottom padding

  const doc = new PDFDocument({ margin: 0, autoFirstPage: false });
  const out = fs.createWriteStream(outPath);
  doc.pipe(out);
  doc.registerFont("Sans", "Helvetica");

  for (let i = 0; i < quantity; i++) {
    doc.addPage({ size: [W, H], margin: 0 });

    // Border
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

    // Top band texts
    // Index — top-left
    doc.save().font("Sans").fontSize(indexFontPt).fillColor("black");
    doc.text(String(indexStart + i), paddingPt, paddingPt - 1, {
      width: 40,
      align: "left",
    });
    doc.restore();

    // Name — top-right (use the whole width but right-align)
    doc.save().font("Sans").fontSize(nameFontPt).fillColor("black");
    doc.text(product.name, paddingPt, paddingPt - 1, {
      width: W - 2 * paddingPt,
      align: "right",
    });
    doc.restore();

    // Barcode image — FULL WIDTH under the top band
    try {
      // Use fit to ensure it never exceeds height; width will be maxed
      // If you want to hard-force width regardless of height, use:
      //   doc.image(imagePath, imgLeft, imgTop, { width: imgW });
      // (but that can overflow vertically on unusual images)
      doc.image(imagePath, imgLeft, imgTop, { fit: [imgW, imgH] });
    } catch {
      // Red X if unreadable path
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
  return outPath;
}

module.exports = { generateUPCLabels };

/* Example:
(async () => {
  await generateUPCLabels(
    { name: "Sample Item", upc: "076351309811" }, // ../ASSETS/UPC-ZUMA/076351309811.jpg
    10,
    { indexStart: 1, topBandPt: 12 }
  );
})();
*/
