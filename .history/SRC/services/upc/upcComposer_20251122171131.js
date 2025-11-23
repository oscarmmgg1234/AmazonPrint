
const 
const path = require("path");
const PDFDocument = require("pdfkit");

const PT_PER_IN = 72;
const inToPt = (inches) => Math.round(inches * PT_PER_IN * 1000) / 1000; // exact rounding


//we get 460x308 upc jpgs that we need to include
/**
 * Generates barcode label PDFs fully in memory and returns Base64 array
 * @param {Object} product { name, upc, imagePath?, imageFilename? }
 * @param {number} quantity
 * @param {Object} opts optional fine-tuning
 * @returns {Promise<string[]>} array of Base64-encoded PDFs
 */
async function generateUPCLabels(product, quantity, opts = {}) {
  if (!product || !product.name) throw new Error("product.name is required");
  if (!Number.isFinite(quantity) || quantity <= 0)
    throw new Error("quantity must be > 0");

  const {
    assetsSubdir = path.join("..", "ASSETS", "UPC-ZUMA"),
    labelW_in = 2, // label width (inches)
    labelH_in = 1, // label height (inches)
    heightAdjust_in = 0.0,
    paddingPt = 6,
    borderPt = 1,
    rounded = true,
    nameFontPt = 7,
    indexFontPt = 7,
    topBandPt = 14,
    indexStart = 1,
  } = opts;

  // --- resolve image path ---
  const assetsDir = path.join(__dirname, assetsSubdir);
  let imagePath = product.imagePath;
  if (!imagePath && product.imageFilename)
    imagePath = path.join(assetsDir, product.imageFilename);
  if (!imagePath && product.upc)
    imagePath = path.join(assetsDir, `${product.upc}.jpg`);

  // --- label geometry ---
  const W = inToPt(labelW_in);
  const H = inToPt(labelH_in + heightAdjust_in);
  const imgLeft = paddingPt;
  const imgTop = paddingPt + topBandPt;
  const imgW = W - 2 * paddingPt;
  const imgH = H - imgTop - paddingPt;

  const pdfBuffers = [];

  for (let i = 0; i < quantity; i++) {
    const buffers = [];
    const doc = new PDFDocument({
      size: [W, H],
      margins: { top: 0, left: 0, bottom: 0, right: 0 },
      autoFirstPage: false,
    });
    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("error", (err) => console.error("PDFKit error:", err));
    doc.registerFont("Sans", "Helvetica");

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

    // Index (top-left)
    doc.save().font("Sans").fontSize(indexFontPt).fillColor("black");
    doc.text(`ZUMA-${String(indexStart + i)}`, paddingPt, paddingPt - 1, {
      width: 80,
      align: "left",
    });
    doc.restore();

    // Product name (top-right, truncated)
    let displayName = product.name;
    if (displayName.length > 35) {
      const front = displayName.substring(0, 21).trim();
      const back = displayName.substring(displayName.length - 6).trim();
      displayName = `${front}...${back}`;
    }

    doc.save().font("Sans").fontSize(nameFontPt).fillColor("black");
    doc.text(displayName, paddingPt, paddingPt - 1, {
      width: W - 2 * paddingPt,
      align: "right",
    });
    doc.restore();

    // Barcode image (optional)
    try {
      if (imagePath) {
        doc.image(imagePath, imgLeft, imgTop, { width: imgW, height: imgH });
      } else {
        doc
          .moveTo(imgLeft, imgTop)
          .lineTo(imgLeft + imgW, imgTop + imgH)
          .strokeColor("red")
          .stroke();
      }
    } catch (e) {
      console.warn("Image missing:", imagePath);
    }

    doc.end();

    const pdfBuffer = await new Promise((resolve, reject) => {
      const finish = () => resolve(Buffer.concat(buffers));
      doc.on("end", finish);
      doc.on("error", reject);
    });

    pdfBuffers.push(pdfBuffer.toString("base64"));
  }

  return pdfBuffers;
}

module.exports = { generateUPCLabels };
