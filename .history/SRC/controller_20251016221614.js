const AssetManager = require("./assetManager").AssetManager;
const printUPCLabels = require("./printManager").printUPCLabels;

(async () => {
  await printUPCLabels({ name: "Example Productrtwertwertwertwertwertwertwertwertwertwe", upc: "676351309811" }, 2, {
    printerName: "Rollo Printer",
    sumatraPath: "C:\\Users\\PC\\AppData\\Local\\SumatraPDF\\SumatraPDF.exe",
  });
})();


class controller {
  constructor() {
    this.assetManager = new AssetManager;
  }

  getProducts() {
    return this.assetManager.getProducts();
  }
  async printJob(data){
    await 
  }
}

exports.controller = controller;
