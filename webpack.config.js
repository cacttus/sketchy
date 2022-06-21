//NOTE: https://stackoverflow.com/questions/48476061/electron-and-typescript-fs-cant-be-resolved
//https://dev.to/riddhiagrawal001/create-react-app-without-create-react-app-2lgd
//https://www.geeksforgeeks.org/hot-reload-in-electronjs/

const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const _ = require('lodash');

// import webpack from 'webpack';
// import path from "path";
// import _ from 'lodash';
// import { dirname } from 'path'
// import { fileURLToPath } from 'url'
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = dirname(__filename)


//This is a quick way to have multiple webpack configurations in one go of webpack.
var template = {
  //mode: 'development', //'development' or 'production' will minify the code
  entry: {
  },
  //path.resolve(__dirname, "./src/Main.tsx"),
  target: '',
  devtool: 'source-map',
  stats: 'normal',
  module: {
    rules: [
      {
        test: /\.tsx?/,
        use: [{ loader: 'ts-loader', options: { onlyCompileBundledFiles: true } }]
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.scss$/,
        loader: 'sass-loader' // 将 Sass 编译成 CSS
      },
      {
        test: /\.png|svg|jpg|gif$/,
        use: ["file-loader"],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: ['file-loader?name=[name].[ext]&outputPath=images/&publicPath=images/',
          'image-webpack-loader'
        ]
      },
      {
        test: /\.(eot|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
        use: 'file-loader?name=[name].[ext]&outputPath=fonts/&publicPath=fonts/'
      }
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".tsx", ".ts"],
    fallback: { "path": false }
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].js",
    publicPath: "/assets/",
    clean: false,
    library: {
      type: 'var',
      name:'ElectronApp' //Very important so that we can expose client side controls and create components at runtime.
    }

  },
  plugins: [],
  devServer: {
    host: "localhost",
    hot: true,
    port: 8000,
    https: false,
    static: {
      directory: path.join(__dirname, 'dist'),
    },

  }
};

//Render Process
var render = _.cloneDeep(template);//I'm not sure why json.parse/stringify isn't working. If we get that to work, remove lodash 

//We should be able to do this without manually speicfying files.
//Maybe use directories instead
render.entry = {
  MainWindow: path.resolve(__dirname, "./src/MainWindow.tsx"),
  AboutWindow: path.resolve(__dirname, "./src/AboutWindow.tsx"),
  SettingsWindow: path.resolve(__dirname, "./src/SettingsWindow.tsx"),
};
render.target = 'electron-renderer';

//Main process
var main = _.cloneDeep(template);
main.entry = {
  Main: path.resolve(__dirname, "./src/Main.tsx"),
};
main.target = 'electron-main';

module.exports = [render, main];