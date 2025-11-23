const AssetManager = require("../services/upc/assetManager").AssetManager;
const { query_manager } = require("../db/dbManger");



const { generateUPCLabels } = require("../services/upc/upcComposer");
class controller {
  constructor() {
    this.assetManager = new AssetManager();
  }

  async getProducts() {
    const products = await query_manager.raw("SELECT * FROM amazon_products");
    const output = products[0].forEach((product) => {
      return 
    }
    return products[0];
  }
}

exports.controller = controller;
