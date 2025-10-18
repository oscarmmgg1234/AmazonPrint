const xlsx = require("xlsx");
const path = require("path");

const path = path.join
const workbook = xlsx.readFile(path.join(__dirname, "ASSETS", "products.xlsx"));