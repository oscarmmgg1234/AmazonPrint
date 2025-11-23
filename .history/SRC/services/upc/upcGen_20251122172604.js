/**
 * UPC-A Generator Module (Scaffold)
 *
 * Generates a 460x308 UPC-A barcode image (PNG stream or Buffer) with
 * human-readable digits underneath, using bwip-js.
 *
 * Author: Oscar Maldonado
 * Email: oscarmmgg1234@gmail.com
 * Date: 2025-11-20
 */

const bwipjs = require("bwip-js");
const { Readable } = require("stream");

/**
 * Generate a UPC-A barcode image at 460×308 px
 *
 * @param {string} upc - 11 or 12-digit UPC value
 * @param {Object} opts - optional behavior overrides
 * @param {boolean} opts.asStream - return Readable stream (default: true)
 * @returns {Promise<Readable|Buffer>}
 */
async function generateUPCA(upc, opts = {}) {
  if (!upc) throw new Error("UPC code is required");
  if (!/^\d{11,12}$/.test(upc)) throw new Error("UPC must be 11 or 12 digits");

  const { asStream = true } = opts;

  // normalize to 12 digits (bwip-js will compute checksum if 11 digits)
  const text = upc;

  // bwip-js render → PNG buffer at 460×308
  const pngBuffer = await bwipjs.toBuffer({
    bcid: "upca", // Barcode type
    text, // UPC digits
    scale: 3, // Fine-tune until final output = 460x308
    includetext: true, // Show human-readable text
    textxalign: "",
    textsize: 11, // Rendered font size (adjust as needed)
    height: 52, // Barcode bar height inside the image
    paddingwidth: 0,
    paddingheight: 0,
    backgroundcolor: "FFFFFF", // White
  });

  // If caller wants a stream:
  if (asStream) {
    const stream = new Readable();
    stream.push(pngBuffer);
    stream.push(null);
    return stream;
  }

  return pngBuffer; // direct buffer if preferred
}

module.exports = { generateUPCA };
