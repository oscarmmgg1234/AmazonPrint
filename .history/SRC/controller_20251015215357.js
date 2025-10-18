const AssetManager = require("./assetProcessor").AssetManager;
const assetManager = new AssetManager();

class controller {
  constructor() {
    this.assetManager = new AssetManager;
  }

  getProducts() {
    return assetManager.getProducts();
  }
}

exports.controller = controller;
