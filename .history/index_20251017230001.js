const express = require("express");
const app = express();
const port = 3006;
app.use(express.json()); // for application/json
app.use(express.urlencoded({ extended: true }));
const controller = require("./SRC/controller").controller;
const Controller = new controller();
const { generateUPCLabels } = require("./SRC/upcComposer");


app.get("/getProducts", (req, res) => {
  res.send(Controller.getProducts());
});

app.post("/printJob", async (req, res) => {
  //product UPC code
  //const quantity
   try {
     const { product, quantity } = req.body;
     const pdfBuffer = await generateUPCLabels(product, quantity);
    console.log()
     res.setHeader("Content-Type", "application/pdf");
     res.setHeader("Content-Disposition", "inline; filename=label.pdf");
     res.send(pdfBuffer); // 🔥 send directly to client
   } catch (err) {
     console.error(err);
     res.status(500).send("Error generating label");
   }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
