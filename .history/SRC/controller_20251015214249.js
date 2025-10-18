const AssetManager = require("./assetProcessor").AssetManager;
const assetManager = new AssetManager();



class controller {
    constructor() {
        assetManager.getUpc();
    }
}


exports.controller = controller;