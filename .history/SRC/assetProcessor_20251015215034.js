const xlsx = require("xlsx");
const path = require("path");

class AssetManager {
  constructor() {
    this.upcs = new Map();
    this.loadAssets();
  }
  loadAssets() {
    const workbook = xlsx.readFile(
      path.join(__dirname, "..", "ASSETS/Amazon Skus.xlsx")
    );
    const data = xlsx.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]]
    );
    data.forEach((item) => {
      this.upcs.set(item["Product Name"], item["UPC Codes"]);
    });
  }
  getProducts() {
    return Array.from(this.upcs.keys());
  }
}

exports.AssetManager = AssetManager;
