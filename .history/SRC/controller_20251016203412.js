const AssetManager = require("./assetManager").AssetManager;
con
class controller {
  constructor() {
    this.assetManager = new AssetManager;
  }

  getProducts() {
    return this.assetManager.getProducts();
  }
}

exports.controller = controller;
