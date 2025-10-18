const xlsx = require("xlsx");
const path = require("path");

class AssetManager {
  constructor() {
    this.upcs = new Map();
  }
  loadAssets() {
    const workbook = xlsx.readFile(
      path.join(__dirname, "..", "ASSETS/Amazon Skus.xlsx")
    );
    
  }
}

