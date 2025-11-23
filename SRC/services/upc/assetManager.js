const xlsx = require("xlsx");
const path = require("path");

//So instead of using the google drive for this purpose, we will use the local state for these files
// ASSETS/Amazon Skus.xlsx So any updates will be done directly though git, they will push new files
// The cost of integrating google drive api and or dropbox ...etc the cost of this is not worth the effor
// This way we can also have version control on these files
// If we need to update them we just push a new commit with the updated files
// This makes it easier to deploy since i have 




class AssetManager {
  constructor() {
    this.upcs = new Map();
    this.loadAssets();
  }
  loadAssets() {
    const workbook = xlsx.readFile(
      path.join(__dirname, "../../..", "ASSETS/Amazon Skus.xlsx")
    );
    const data = xlsx.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]]
    );
    data.forEach((item) => {
      this.upcs.set(item["Product Name"], item["UPC Codes"]);
    });
  }
  getProducts() {
    let products = [];
    this.upcs.forEach((value, key) => {
      products.push({ name: key, upc: value });
    });
    return products;
  }
}

exports.AssetManager = AssetManager;
