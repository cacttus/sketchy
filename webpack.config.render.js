//NOTE: https://stackoverflow.com/questions/48476061/electron-and-typescript-fs-cant-be-resolved
//https://dev.to/riddhiagrawal001/create-react-app-without-create-react-app-2lgd
//https://www.geeksforgeeks.org/hot-reload-in-electronjs/
const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  //mode: 'development', //'development' or 'production' will minify the code
  mode: "development",
  entry: path.resolve(__dirname, "./src/MainWindow.tsx"),
  target: 'electron-renderer',
  devtool: 'eval-source-map',
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
    filename: "MainWindow.js",
    publicPath: "/assets/",
    clean: false
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
