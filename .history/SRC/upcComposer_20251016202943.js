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

    // Create a new PDF document
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(outputPath));

    // Generate UPC labels
    for (let i = 0; i < quantity; i++) {
        const upc = assetManager.getUPC(product);
        doc.text(`Product: ${product}\nUPC: ${upc}\n\n`, { align: "center" });
    }

    doc.end();
    console.log(`✅ PDF created: ${outputPath}`);

}