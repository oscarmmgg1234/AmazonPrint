const AssetManager = require("./assetManager").AssetManager;
const printUPCLabels = require("./printManager").printUPCLabels;




class controller {
  constructor() {
    this.assetManager = new AssetManager;
  }

  getProducts() {
    return this.assetManager.getProducts();
  }
}

exports.controller = controller;
