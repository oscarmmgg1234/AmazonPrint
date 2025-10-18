const AssetManager = require("./assetProcessor").AssetManager;
const assetManager = new AssetManager();



class controller {
    constructor() {
        assetManager.getUpc();
    }

    getProducts(){
        
    }
}

exports.controller = controller;