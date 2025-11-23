const AssetManager = require("../services/upc/assetManager").AssetManager;
const { query_manager } = require("../db/dbManger");

class controller {
  constructor() {
    this.assetManager = new AssetManager();
  }

  async checkIfProductExists(upc) {
    const findProduct = await query_manager.raw(
      "SELECT * FROM amazon_products WHERE `UPC` = ?",
      [upc]
    );
    return findProduct[0].length > 0;
  }

  async addProduct(product) {
    const result = await this.assetManager.addProduct(product);    
  }


  async getProducts() {
    const products = await query_manager.raw("SELECT * FROM amazon_products");
    const output = products[0].map((product) => {
      return {
        name: product.product,
        upc: product.UPC,
        id: product.internal_id,
      };
    });
    return output;
  }
}

exports.controller = controller;
