const fs = require("fs");
const PDFDocument = require("pdfkit");
const sizeOf = require("image-size");

function inchesToPoints(inches) {
  return inches * 72; // PDF points per inch
}

async 