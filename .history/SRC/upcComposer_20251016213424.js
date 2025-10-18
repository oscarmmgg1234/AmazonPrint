const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const PT_PER_IN = 72;
const inToPt = (inches) => inches * PT_PER_IN;

/**
 * One page per label — 2" wide × 1" tall.
 * Index → top-left, Name → top-right (max 35 chars).
 * Barcode stretches the full label width beneath a small top band.
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
    paddingPt = 6,
    borderPt = 1,
    rounded = true,
    nameFontPt = 7,
    indexFontPt = 7,
    topBandPt = 14, // reserved height for top texts
    indexStart = 1,
  } = opts;

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

  const outPath = path.join(__dirname, outputFile);
  const outDir = path.dirname(outPath);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const W = inToPt(labelW_in);
  const H = inToPt(labelH_in);

  // image box directly under the top band
  const imgLeft = paddingPt;
  const imgTop = paddingPt + topBandPt;
  const imgW = W - 2 * paddingPt;
  const imgH = H - imgTop - paddingPt; // fills the rest

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
    // Index (top-left)
    doc.save().font("Sans").fontSize(indexFontPt).fillColor("black");
    doc.text(`ZUMA-${String(indexStart + i)}`, paddingPt, paddingPt - 1, {
      width: 40,
      align: "left",
    });
    doc.restore();

    // Name (top-right, cut after 35 chars)
    let displayName = product.name;
    if (displayName.length > 35) {
      displayName = displayName.substring(0, 30).trim() + "...";
    }

    doc.save().font("Sans").fontSize(nameFontPt).fillColor("black");
    doc.text(displayName, paddingPt, paddingPt - 1, {
      width: W - 2 * paddingPt,
      align: "right",
    });
    doc.restore();

    // Barcode — full width across the label
    try {
      doc.image(imagePath, imgLeft, imgTop, { width: imgW, height: imgH });
    } catch {
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
  console.log(`✅ PDF generated at: ${outPath}`);
  return outPath;
}

module.exports = { generateUPCLabels };

/* Example:
(async () => {
  await generateUPCLabels(
    { name: "Very Long Product Name That Should Be Truncated After 35 Characters", upc: "076351309811" },
    5,
    { indexStart: 1 }
  );
})();
*/
