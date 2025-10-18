const xlsx = require("xlsx");
const path = require("path");

class AssetManager {
  constructor() {
    this.upc
  }
  loadAssets() {
    const workbook = xlsx.readFile(
      path.join(__dirname, "..", "ASSETS/Amazon Skus.xlsx")
    );
    
  }
}

