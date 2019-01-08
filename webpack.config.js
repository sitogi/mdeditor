let webpackMerge = require("webpack-merge");

let baseConfig = {
    node: {
        __dirname: false,
        __filename: false
    },
    resolve: {
        extensions: [".js", ".jsx"]
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                loader: "babel-loader"
            },
            {
                test: /\.css$/,
                loaders: [ "style-loader", "css-loader?modules" ]
            }
        ]
    },
    output: {
        filename: "[name].js"
    },
    devtool: "source-map"
};

let mainConfig = webpackMerge(baseConfig, {
    target: "electron-main",
    entry: {
        "main/index": "./src/main/index.js"
    }
});

let rendererConfig = webpackMerge(baseConfig, {
    target: "electron-renderer",
    entry: {
        "renderer/app": "./src/renderer/app.jsx"
    }
});

let pdfConfig = webpackMerge(baseConfig, {
    target: "electron-renderer",
    entry: {
        "renderer/pdf": "./src/renderer/pdf.jsx"
    }
});

        
module.exports = [mainConfig, rendererConfig, pdfConfig]

