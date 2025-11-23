const express = require("express");
const app = express();
const port = 3006;
app.use(express.json()); // for application/json
app.use(express.urlencoded({ extended: true }));
const controller = require("./SRC/controlllers/controller").controller;
const Controller = new controller();
const { generateUPCLabels } = require("./SRC/services/upc/upcComposer");


app.get("/getProducts", async (req, res) => {
  res.send(await Controller.getProducts());
});

app.post("/addProduct", async (req, res) => {
}

app.post("/printJob", async (req, res) => {
  //product UPC code
  //const quantity
    try {
      const { product, quantity } = req.body;
      if (!product || !product.name)
        return res
          .status(400)
          .json({ error: true, process_des: "Missing product info" });

      const data = await generateUPCLabels(product, Number(quantity) || 1);
      res.json({ error: false, data });
    } catch (err) {
      console.error("Error in printJob:", err);
      res.status(500).json({
        error: true,
        process_des: err.message || "Internal PDF generation error",
      });
    }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
