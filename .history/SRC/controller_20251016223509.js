const AssetManager = require("./assetManager").AssetManager;
const printUPCLabels = require("./printManager").printUPCLabels;

class controller {
  constructor() {
    this.assetManager = new AssetManager();
  }

  getProducts() {
    return this.assetManager.getProducts();
  }
  async printJob(data) {
    await printUPCLabels(data.product, data.quantity, {
      printerName: "Rollo Printer",
      sumatraPath: "C:\\Users\\PC\\AppData\\Local\\SumatraPDF\\SumatraPDF.exe",
    });
  }
}

exports.controller = controller;
