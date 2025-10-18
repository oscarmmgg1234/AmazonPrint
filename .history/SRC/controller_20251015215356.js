const AssetManager = require("./assetProcessor").AssetManager;
const assetManager = new AssetManager();

class controller {
  constructor() {
    this.assetManager = new assetManager;
  }

  getProducts() {
    return assetManager.getProducts();
  }
}

exports.controller = controller;
