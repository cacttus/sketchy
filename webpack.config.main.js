const webpack = require("webpack");
const path = require("path");


module.exports = {
 // mode: 'development', //'development' or 'production' will minify the code
  entry: path.resolve(__dirname, "./src/Main.tsx"),
  target: 'electron-main', //electron-renderer
  devtool: 'eval-source-map',
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
        test: /\.svg$/,
        use: ['svg-url-loader'],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx", ".tsx", ".ts"],
    fallback: { "path": false }
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "main.js",
    publicPath: "/assets/",
    clean: false
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
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
