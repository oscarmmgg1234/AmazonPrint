const AssetManager = require("../services/upc/assetManager").AssetManager;
const { query_manager } = require("../db/dbManger");



const { generateUPCLabels } = require("../services/upc/upcComposer");
class controller {
  constructor() {
    this.assetManager = new AssetManager();
  }

  async getProducts() {
    const products = await query_manager.raw("SELECT * FROM amazon_products");
    const products[0].forEach((product) => {
      product.image_url = this.assetManager.getProductImageURL(product.asin);
    }
    return products[0];
  }
}

exports.controller = controller;
