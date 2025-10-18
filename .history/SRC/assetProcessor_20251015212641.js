const xlsx = require("xlsx");
const path = require("path");


const workbook = xlsx.readFile(path.join(__dirname, "ASSETSS", "products.xlsx"));