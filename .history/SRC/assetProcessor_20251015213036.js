const xlsx = require("xlsx");
const path = require("path");

const pathe = path.join(__dirname, "ASSETS/Amazon Skus.xlsx");
console.log(pathe);
const workbook = xlsx.readFile(path.join(__dirname,"" "ASSETS/Amazon Skus.xlsx"));