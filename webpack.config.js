const path = require(`path`);
const webpack = require(`webpack`);

/* Constants */
const isProduction = process.env.NODE_ENV === `production`;

/* Webpack Plugins */
const CleanWebpackPlugin = require(`clean-webpack-plugin`);
const HtmlWebpackPlugin = require(`html-webpack-plugin`);
const ExtractTextPlugin = require(`extract-text-webpack-plugin`);
const { CheckerPlugin } = require(`awesome-typescript-loader`);
const Visualizer = require(`webpack-visualizer-plugin`);
const UglifyJsPlugin = require(`uglifyjs-webpack-plugin`);
// const OfflinePlugin = require(`offline-plugin`);

/* Babel Plugins */

/* Config */
const html = {
  title: `test`,
  template: `src/index.html`,
};

const babel = {
  presets: [
    [
      `@babel/preset-env`,
      {
        targets: {
          browsers: [`last 2 versions`],
        },
      }
    ],
    `@babel/typescript`,
  ].filter(x => x),
  plugins: [
    `transform-object-rest-spread`,
  ].concat(
    isProduction
      ? [
        // `minify-constant-folding`, // Breaks Tags
        `minify-dead-code-elimination`,
        `minify-flip-comparisons`,
        `minify-guarded-expressions`,
        `minify-infinity`,
        // `minify-mangle-names`, // Broken
        `minify-replace`,
        `minify-simplify`,
        `minify-type-constructors`,
        `transform-member-expression-literals`,
        `transform-merge-sibling-variables`,
        `transform-minify-booleans`,
        `transform-property-literals`,
        `transform-simplify-comparison-operators`,
        `transform-undefined-to-void`,
      ]
      : []
  ),
};

module.exports = {

  entry: {
    index: `./src/${isProduction ? `index.ts` : `dev.js`}`,
  },

  output: {
    path: path.resolve(__dirname, `dist`),
    filename: `[name].[hash].js`,
    chunkFilename: `[name].bundle.js`,
  },

  module: {
    rules: [

      { // Typescript Loader
        test: /\.ts$/,
        exclude: /(node_modules|bower_components)/,
        use: [
          {
            loader: `babel-loader`,
            options: babel,
          },
          {
            loader: `awesome-typescript-loader`,
          },
        ],
      },

      { // Style Loader
        test: /\.css|\.scss|\.sass/,
        exclude: /node_modules/,
        use: isProduction ?
          ExtractTextPlugin.extract({
            fallback: `style-loader`,
            // resolve-url-loader may be chained before sass-loader if necessary
            use: [`css-loader`, `resolve-url-loader`, `sass-loader`],
          }) :
          [`style-loader`, `css-loader`, `resolve-url-loader`, `sass-loader`],
      },

      { // file Loader
        test: /\.(jpe?g|png|gif|svg|eot|ttf|woff|woff2)$/i,
        exclude: /node_modules/,
        use: {
          loader: `url-loader`,
          options: {
            name: `[name].[hash].[ext]`,
            limit: 1000,
          },
        },
      },

    ],
  },

  plugins: [
    new HtmlWebpackPlugin(html),
    new CleanWebpackPlugin([`dist`]),
    new ExtractTextPlugin(`styles.[hash].css`),
    !isProduction && new webpack.HotModuleReplacementPlugin(),
    !isProduction && new webpack.NamedModulesPlugin(),
    !isProduction && new CheckerPlugin(),
    isProduction && new webpack.optimize.ModuleConcatenationPlugin(),
    isProduction && new Visualizer({ filename: `../build-statistics.html` }),
    isProduction && new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(`production`)
      }
    }),
    isProduction && new UglifyJsPlugin(),
    // isProduction && new OfflinePlugin(),
  ].filter((x) => x),

  resolve: {
    modules: [path.resolve(__dirname, `src`), `node_modules`],
    extensions: [
      `.js`,
      `.jsx`,
      `.ts`,
      `.tsx`,
      `.scss`,
      `.css`,
    ],
  },

  devtool: isProduction ?
    false :
    `eval-source-map`,

  devServer: {
    hot: true,
    contentBase: path.join(__dirname, `dist`),
    compress: true,
    port: 8000,
  },

};
