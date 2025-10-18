const xlsx = require("xlsx");
const path = require("path");


const workbook = xlsx.readFile(path.join(__dirname,"..","ASSETS/Amazon Skus.xlsx"));
const data = c