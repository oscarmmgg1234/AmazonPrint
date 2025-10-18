const fs = require("fs");
const PDFDocument = require("pdfkit");
const sizeOf = require("image-size");
const assetManager = require("./assetManager").AssetManager;
const AssetManager = new assetManager();
function inchesToPoints(inches) {
  return inches * 72; // PDF points per inch
}

async function generateUPCLabels()