const AssetManager = require("./assetProcessor").AssetManager;

class controller {
  constructor() {
    this.assetManager = new AssetManager;
  }

  getProducts() {
    return this.assetManager.getProducts();
  }
}

exports.controller = controller;
