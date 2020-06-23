/** Build of the project! */

// Libs
const path = require("path");

// Add Plugins
const HTMLWebpackPlugin = require("html-webpack-plugin"); // Create new html
const CopyWebpackPlugin = require("copy-webpack-plugin"); // Add files to html

const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // Css minification
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin");  // Css minification
const TerserWebpackPlugin = require("terser-webpack-plugin"); // JavaScript minification

const { CleanWebpackPlugin } = require("clean-webpack-plugin"); // Clean dist directory
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer"); // Analyze your BUILD

// Environments
const isDev = process.env.NODE_ENV === "development";
const isStat = process.env.NODE_STAT;
const isProd = !isDev;

// Functions
const optimization = () => {
  const optimization = {
    splitChunks: {
      chunks: "all"
    }
  }

  if (isProd) {
    optimization.minimizer = [
      new OptimizeCssAssetsWebpackPlugin(),
      new TerserWebpackPlugin()
    ]
  }

  return optimization;
}

const babelLoaderOption = preset => {
  const babelLoaderOptions = {
    presets: [
      "@babel/preset-env"
    ],
    plugins: [
      "@babel/plugin-proposal-class-properties"
    ]
  }

  if (preset) babelLoaderOptions.presets.push(preset);

  return babelLoaderOptions;
}

const styleLoader = extra => {
  const styleLoader = [{
    loader: MiniCssExtractPlugin.loader,
    options: {
      hmr: isDev,
      reloadAll: true
    }
  }, "css-loader"];

  if (extra) styleLoader.push(extra);

  return styleLoader;
}

const filename = ext => {
  return isDev ? `[name].${ext}` : `[name].[hash].${ext}`;
}

const plugins = () => {
  const plugins = [
    new HTMLWebpackPlugin({
      template: "./index.html",
      minify: {
        collapseWhitespace: isProd
      }
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'favicon.ico', to: '../dist' },
      ],
    }),
    new MiniCssExtractPlugin(
      {
        filename: filename("css")
      }
    )
  ]

  if (isStat) plugins.push(new BundleAnalyzerPlugin());

  return plugins;
}

/******/ /* Settings */ /******/
module.exports = {
  context: path.resolve(__dirname, "src"), // Start directory for webpack
  mode: "development",
  entry: { 
    main: ["@babel/polyfill", "./index.js"],
    external: "./external.ts", // Connecting own external code
  },

  output: {
    filename: filename("js"),
    path: path.resolve(__dirname, "dist") // Derictory for build
  },

  devServer: { // Autoupdating server
    port: 4200,
    hot: isDev
  },

  optimization: optimization(),

  resolve: {
    extensions: [".js", "json", "png"], // Without ending in path
    alias: {
      "@models": path.resolve(__dirname, "src/models"), // Add @lias path
      "@": path.resolve(__dirname, "src"),
    }
  },

  module: {
    rules: [
      {
        test: /\.css$/, // support css
        use: styleLoader(),
      },
      {
        test: /\.s[ac]ss$/, // support scss
        use: styleLoader("sass-loader"), 
      },
      {
        test: /\.(png|jpg|svg|gif)$/, // support images
        use: ["file-loader"]
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/, // support fonts
        use: ["file-loader"]
      },
      {
        test: /\.js$/, // support babel javascript
        exclude: /node_modules/,
        loader: {
          loader: "babel-loader",
          options: babelLoaderOption()
        }
      },
      {
        test: /\.ts$/, // support typescript
        exclude: /node_modules/,
        loader: {
          loader: "babel-loader",
          options: babelLoaderOption("@babel/preset-typescript")
        }
      }
    ]
  },

  plugins: plugins(),
}