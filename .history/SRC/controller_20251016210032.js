const AssetManager = require("./assetManager").AssetManager;
const generateUPCLabels = require("./upcComposer").generateUPCLabels;
// Example usage (uncomment to test):
(async () => {
  const file = await generateUPCLabels(
    { name: "example product", upc: "676351309811" },
    12
  );
  console.log("Created:", file);
})();

class controller {
  constructor() {
    this.assetManager = new AssetManager;
  }

  getProducts() {
    return this.assetManager.getProducts();
  }
}

exports.controller = controller;
