const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const sizeOf = require("image-size");

function inchesToPoints(inches) {
  return inches * 72; // PDF points per inch
}

// ---- your existing function signature ----
async function generateUPCLabels(product, quantity) {
  // product can be:
  // { name, upc } -> image assumed at ../ASSETS/<upc>.jpg
  // OR { name, imageFilename } -> ../ASSETS/<imageFilename>
  // OR { name, imagePath } -> explicit path
  // quantity = integer copies to print

  if (!product || !product.name) throw new Error("product.name is required");
  if (!Number.isFinite(quantity) || quantity <= 0)
    throw new Error("quantity must be > 0");

  // Paths
  const assetsDir = path.join(__dirname, "..", "ASSETS/UPC-ZUMA");

  const tempDir = path.join(__dirname, "TEMP");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  const outputPath = path.join(tempDir, "temp.pdf");

  // Resolve image path
  let imagePath = product.imagePath;
  if (!imagePath && product.imageFilename) {
    imagePath = path.join(assetsDir, product.imageFilename);
  }
  if (!imagePath && product.upc) {
    imagePath = path.join(assetsDir, `${product.upc}.jpg`);
  }
  if (!imagePath)
    throw new Error(
      "Provide product.upc, product.imageFilename, or product.imagePath"
    );

  // Label dimensions (portrait 1" W × 2" H)
  const labelWidth = inchesToPoints(1);
  const labelHeight = inchesToPoints(2);

  // Layout & styling
  const paddingPt = 6; // inner padding
  const nameBandPt = 14; // height of bottom band for name
  const borderPt = 1; // border thickness
  const rounded = true;

  // Ultra-tall page safety: keep each PDF page under ~200 inches
  const MAX_PAGE_IN = 200;
  const MAX_PAGE_PT = inchesToPoints(MAX_PAGE_IN);
  const labelsPerPage = Math.max(1, Math.floor(MAX_PAGE_PT / labelHeight));
  const totalPages = Math.ceil(quantity / labelsPerPage);

  // Prepare doc
  const doc = new PDFDocument({ margin: 0, autoFirstPage: false });
  const out = fs.createWriteStream(outputPath);
  doc.pipe(out);

  // (Built-in Helvetica – no external font files required)
  doc.registerFont("Sans", "Helvetica");

  // Pre-read image natural size to avoid try/catch per label
  let naturalW = 0,
    naturalH = 0;
  try {
    const dim = sizeOf(imagePath);
    naturalW = dim.width;
    naturalH = dim.height;
  } catch (e) {
    // If image not found, we’ll draw a red X instead
    naturalW = 0;
    naturalH = 0;
  }

  // Render pages
  let remaining = quantity;
  for (let p = 0; p < totalPages; p++) {
    const batchCount = Math.min(remaining, labelsPerPage);
    remaining -= batchCount;

    // Each page stacks N labels vertically: height = N * labelHeight
    doc.addPage({ size: [labelWidth, batchCount * labelHeight], margin: 0 });

    for (let i = 0; i < batchCount; i++) {
      const y0 = i * labelHeight;

      // 1) Border
      doc.save().lineWidth(borderPt).strokeColor("black");
      if (rounded) {
        const r = Math.min(6, Math.min(labelWidth, labelHeight) / 10);
        doc
          .roundedRect(
            0.5 * borderPt,
            y0 + 0.5 * borderPt,
            labelWidth - borderPt,
            labelHeight - borderPt,
            r
          )
          .stroke();
      } else {
        doc
          .rect(
            0.5 * borderPt,
            y0 + 0.5 * borderPt,
            labelWidth - borderPt,
            labelHeight - borderPt
          )
          .stroke();
      }
      doc.restore();

      // 2) Compute image area (reserve bottom band for name)
      const imgLeft = paddingPt;
      const imgTop = y0 + paddingPt;
      const imgWidthAvail = labelWidth - 2 * paddingPt;
      const imgHeightAvail =
        labelHeight - 2 * paddingPt - (nameBandPt + paddingPt); // band + gap
      if (naturalW > 0 && naturalH > 0) {
        const scale = Math.min(
          imgWidthAvail / naturalW,
          imgHeightAvail / naturalH
        );
        const drawW = Math.max(1, naturalW * scale);
        const drawH = Math.max(1, naturalH * scale);
        const drawX = imgLeft + (imgWidthAvail - drawW) / 2;
        const drawY = imgTop + (imgHeightAvail - drawH) / 2;

        console.log(imagePath)
        doc.image(imagePath, drawX, drawY, { width: drawW, height: drawH });
      } else {
        // Red X placeholder if image not found
        doc.save().strokeColor("red");
        doc
          .moveTo(imgLeft, imgTop)
          .lineTo(imgLeft + imgWidthAvail, imgTop + imgHeightAvail);
        doc
          .moveTo(imgLeft + imgWidthAvail, imgTop)
          .lineTo(imgLeft, imgTop + imgHeightAvail);
        doc.stroke().restore();
      }

      // 3) Name band (bottom)
      const bandY = y0 + labelHeight - paddingPt - nameBandPt;
      doc.save().font("Sans").fontSize(9).fillColor("black");
      doc.text(product.name, paddingPt, bandY, {
        width: labelWidth - 2 * paddingPt,
        height: nameBandPt,
        align: "center",
        valign: "center",
      });
      doc.restore();
    }
  }

  doc.end();
  await new Promise((res, rej) => {
    out.on("finish", res);
    out.on("error", rej);
  });

  return outputPath;
}

// Example usage (uncomment to test):
// (async () => {
//   const file = await generateUPCLabels({ name: "Sample Item", upc: "012345678905" }, 100);
//   console.log("Created:", file);
// })();

module.exports = { generateUPCLabels };
