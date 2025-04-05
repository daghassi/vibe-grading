const path = require("path");

module.exports = {
  mode: "production",
  entry: {
    background: "./src/background.js",
    content: "./src/content.js",
    options: "./src/options.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
  },
};
