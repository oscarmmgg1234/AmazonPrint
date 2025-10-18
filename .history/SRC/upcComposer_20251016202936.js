const fs = require("fs");
const PDFDocument = require("pdfkit");
const sizeOf = require("image-size");
const assetManager = require("./assetManager").AssetManager;

function inchesToPoints(inches) {
  return inches * 72; // PDF points per inch
}

async function generateUPCLabels(product, quantity){
    //output = ./TEMP/temp.pdf
    const outputPath = `./TEMP/temp.pdf`;
    const labelWidth = inchesToPoints(1);
    const labelHeight = inchesToPoints(2);
    
}