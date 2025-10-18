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
    try {
      const { product, quantity } = req.body;
      const pdfBuffer = await generateUPCLabels(product, quantity);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=label.pdf");
      res.send(pdfBuffer); // 🔥 send directly to client
    } catch (err) {
      console.error(err);
      res.status(500).send("Error generating label");
    }
  }
}

exports.controller = controller;
