const {generateUPCA] = require("../upc/upcGen");
const PDFDocument = require("pdfkit");
const path = require("path");

const PT_PER_IN = 72;
const inToPt = (inches) => Math.round(inches * PT_PER_IN * 1000) / 1000;

/**
 * Generates barcode label PDFs fully in memory and returns Base64 array
 * @param {Object} product { name, upc }
 * @param {number} quantity
 * @param {Object} opts optional fine-tuning
 * @returns {Promise<string[]>} array of Base64-encoded PDFs
 */
async function generateUPCLabels(product, quantity, opts = {}) {
  if (!product || !product.name) throw new Error("product.name is required");
  if (!product.upc) throw new Error("product.upc is required");
  if (!Number.isFinite(quantity) || quantity <= 0)
    throw new Error("quantity must be > 0");

  const {
    labelW_in = 2,
    labelH_in = 1,
    heightAdjust_in = 0.0,
    paddingPt = 6,
    borderPt = 1,
    rounded = true,
    nameFontPt = 7,
    indexFontPt = 7,
    topBandPt = 14,
    indexStart = 1,
  } = opts;

  // --- label geometry ---
  const W = inToPt(labelW_in);
  const H = inToPt(labelH_in + heightAdjust_in);
  const imgLeft = paddingPt;
  const imgTop = paddingPt + topBandPt;
  const imgW = W - 2 * paddingPt;
  const imgH = H - imgTop - paddingPt;

  const pdfBuffers = [];

  for (let i = 0; i < quantity; i++) {
    // Generate a UPC-A barcode as Buffer
    const upcBuffer = await generateUPCA(product.upc, { asStream: false });

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

    //
    // ---- Border ----
    //
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

    //
    // ---- Index (top-left) ----
    //
    doc.save().font("Sans").fontSize(indexFontPt).fillColor("black");
    doc.text(`ZUMA-${String(indexStart + i)}`, paddingPt, paddingPt - 1, {
      width: 80,
      align: "left",
    });
    doc.restore();

    //
    // ---- Product name (top-right) ----
    //
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

    //
    // ---- Barcode Image (now embedded from generateUPCA) ----
    //
    try {
      doc.image(upcBuffer, imgLeft, imgTop, {
        width: imgW,
        height: imgH,
      });
    } catch (e) {
      console.warn("Failed to embed UPC-A buffer:", e);
    }

    doc.end();

    // finalize PDF
    const pdfBuffer = await new Promise((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);
    });

    pdfBuffers.push(pdfBuffer.toString("base64"));
  }

  return pdfBuffers;
}

module.exports = { generateUPCLabels };
