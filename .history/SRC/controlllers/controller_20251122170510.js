const AssetManager = require("../services/upc/assetManager").AssetManager;
const { query_manager } = require("../db/dbManger");



const { generateUPCLabels } = require("../services/upc/upcComposer");
class controller {
  constructor() {
    this.assetManager = new AssetManager();
  }

  getProducts() {
    return this.assetManager.getProducts();
  }
}

exports.controller = controller;
