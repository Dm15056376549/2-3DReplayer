const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { merge } = require('webpack-merge')


const commonConfig = (env, args) => {
  return {
    entry: './src/js/JaSMIn.ts',
    module: {
      rules: [
        {
          test: /\.s[ac]ss$/i,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: "css-loader",
              options: {
                url: false,
              },
            },
            "sass-loader",
          ],
        },
        {
          test: /\.[tj]sx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },
    // Use three.js as an external ressource
    externals: {
      three: 'THREE',
      pako: 'pako'
    },
    resolve: {
      // Bundle three.js together with JaSMIn
      // alias: {
      //     three: path.resolve('./node_modules/three')
      // },
      extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
      filename: 'js/JaSMIn.js',
      library: {
        type: 'umd',
        name: 'JaSMIn',
      },
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      // publicPath: '/',
      globalObject: 'this',
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "css/JaSMIn.css",
      }),
      new CopyPlugin({
        patterns: [
          {
            from: "resources",
            to: ".",
            globOptions: {
              dot: false,
              gitignore: false,
            },
          },
          {
            from: "misc/gamelogs",
            to: "archive",
            globOptions: {
              dot: false,
              gitignore: false,
            },
          },
          {
            from: "src/html",
            to: ".",
            globOptions: {
              dot: false,
              gitignore: false,
            },
          },
          {
            from: "src/php",
            to: ".",
            globOptions: {
              dot: false,
              gitignore: false,
            },
          },
          {
            from: "src/svg",
            to: "images",
            globOptions: {
              dot: false,
              gitignore: false,
              ignore: ['favicon.svg']
            },
          },
          {
            from: 'node_modules/three/build/three.min.js',
            to: 'js/three.min.js',
          },
          {
            from: 'node_modules/pako/dist/pako_inflate.min.js',
            to: 'js/pako_inflate.min.js',
          },
        ],
      }),
    ],
  }
};


const productionConfig = {
  mode: 'production',
  performance: {
    hints: false
  },
};


const developmentConfig = {
  mode: 'development',
  devtool: 'source-map',
};


module.exports = (env, args) => {
  const cc = commonConfig(env, args);

  switch(args.mode) {
    case 'production':
      return merge(cc, productionConfig);
    case 'development':
      return merge(cc, developmentConfig);
    default:
      throw new Error('No matching configuration was found!');
  }
};
