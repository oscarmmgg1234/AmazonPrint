const AssetManager = require("../services/upc/assetManager").AssetManager;
const { query_manager } = require("../db/dbManger");
const {v4: uuidv4} = require("uuid");

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
    const result = await this.checkIfProductExists(product.upc);
    if (result) {
      return { valid: false, message: "Product with this UPC already exists." };
    } 
    await query_manager.raw(
      "INSERT INTO amazon_products (internal_id,product, UPC) VALUES (?, ?, ?)",
      [uuidv4(), product.name, product.upc]
    );
    return { valid: true, message: "Product added successfully." };
  }

  async editProduct(product) {
    await query_manager.raw(
      "UPDATE amazon_products SET product = ?, UPC = ? WHERE internal_id = ?",
      [product.name, product.upc, product.id]
    );
    
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
