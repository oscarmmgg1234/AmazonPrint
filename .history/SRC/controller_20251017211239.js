const AssetManager = require("./assetManager").AssetManager;

const { generateUPCLabels } = require("./upcComposer");
class controller {
  constructor() {
    this.assetManager = new AssetManager();
  }

  getProducts() {
    return this.assetManager.getProducts();
  }
  async printJob(data) {
   
  }
}

exports.controller = controller;
