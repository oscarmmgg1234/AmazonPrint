const express = require("express");
const app = express();
const port = 3006;

const controller = require("./SRC/controller").controller;
const Controller = new controller();
app.post("/printJob", async (req, res) => {
  //product UPC code
  //const quantity
  res.send("Print job received");
});

app.get("/getProducts", (req, res) => {
  res.send(Controller.getProducts());
});

app.post("/printJob", async (req, res) => {

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
