const xlsx = require("xlsx");
const path = require("path");


class AssetManager {
    constructor
}


const workbook = xlsx.readFile(path.join(__dirname,"..","ASSETS/Amazon Skus.xlsx"));
const data = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);


