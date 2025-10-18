const fs = require("fs");
const PDFDocument = require("pdfkit");
const sizeOf = require("image-size");


function inchesToPoints(inches) {
  return inches * 72; // PDF points per inch
}

async function generateUPCLabels(product, quantity){
    //directory for list of pngs = ../ASSETS 
    //image will be the 
    //output = ./TEMP/temp.pdf
    const outputPath = `./TEMP/temp.pdf`;
    const labelWidth = inchesToPoints(1);
    const labelHeight = inchesToPoints(2);
    
}