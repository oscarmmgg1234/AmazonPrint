const AssetManager = require("./assetProcessor").AssetManager;
const assetManager = new AssetManager();



class controller {
    constructor() {
        assetManager.getUpc();
    }

    getProducts(){
        return assetManager.getProducts();
    }
}

exports.controller = controller;