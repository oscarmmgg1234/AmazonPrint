const AssetManager = require("../services/upc/assetManager").AssetManager;
const { query_manager } = require("../db/dbManger");



const { generateUPCLabels } = require("../services/upc/upcComposer");
class controller {
  constructor() {
    this.assetManager = new AssetManager();
  }

  async getProducts() {
    const products = await query_manager.raw("SELECT * FROM amazon_products");
    const output = products[0].((product) => {
      return {name: product.product, upc: product.UPC};
    });
    return output;
  }
}

exports.controller = controller;
