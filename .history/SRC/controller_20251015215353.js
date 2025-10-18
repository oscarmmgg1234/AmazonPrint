const AssetManager = require("./assetProcessor").AssetManager;
const assetManager = new AssetManager();

class controller {
  constructor() {
    this.assetManager = assetManager;
  }

  getProducts() {
    return assetManager.getProducts();
  }
}

exports.controller = controller;
