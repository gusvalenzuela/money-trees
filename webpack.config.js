const WebpackPwaManifest = require("webpack-pwa-manifest");
// const path = require("path");

const config = {
  mode: "development",
  entry: [
    __dirname + "/src/_js/index.js",
    __dirname + "/src/_js/jquery-3.5.1.min.js",
    // user: "./public/user.js",
  ],
  output: {
    path: __dirname + "/public/dist",
    publicPath: "/",
    filename: "bundle.js",
  },
  plugins: [
    new WebpackPwaManifest({
      fingerprints: false,
      inject: false,
      filename: "manifest.webmanifest",
      name: "Money Trees Budget App",
      short_name: "Money Trees",
      description:
        "An application giving users a fast and easy way to track their money.",
      background_color: "#f14209",
      theme_color: "#ffffff",
      start_url: "/",
      // icons: [
      //   {
      //     src: path.resolve("public/assets/images/icons/icon-192x192.png"),
      //     sizes: [96, 128, 192, 256, 384, 512],
      //     destination: path.join("assets", "icons"),
      //   },
      // ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.css$/,
        exclude: /(node_modules)/,
        use: [
          // "style-loader",
          { loader: "css-loader", options: { importLoaders: 1 } },
          "postcss-loader",
        ],
      },
    ],
  },
};
module.exports = config;
