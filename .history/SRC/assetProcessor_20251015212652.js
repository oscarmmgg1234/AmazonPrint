const xlsx = require("xlsx");
const path = require("path");

const path = path
const workbook = xlsx.readFile(path.join(__dirname, "ASSETS", "products.xlsx"));