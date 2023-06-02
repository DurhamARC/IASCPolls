const path = require("path");
const BundleTracker = require("webpack-bundle-tracker");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: {
    frontend: "./src/index.jsx",
  },
  output: {
    filename: "[name]-[chunkhash].js",
    chunkFilename: "[name]-[chunkhash].bundle.js",
    path: path.resolve("../frontend/static/dist/"),
    publicPath: "static/dist/",
  },
  plugins: [
    new CleanWebpackPlugin(),
    new BundleTracker({
      path: __dirname,
      filename: "./webpack-stats.json",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(jpe?g|png|gif|svg|webp)$/i,
        use: {
          loader: "url-loader",
          options: {
            limit: 25000,
          },
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        reactVendor: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
          name: "vendor-react",
          chunks: "all",
        },
        axios: {
          test: /[\\/]node_modules[\\/](axios)[\\/]/,
          name: "axios",
          chunks: "all",
        },
        reactSelect: {
          test: /[\\/]node_modules[\\/](react-select)[\\/]/,
          name: "react-select",
          chunks: "all",
        },
      },
    },
  },
};
