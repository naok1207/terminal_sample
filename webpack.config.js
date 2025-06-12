const path = require('path');

module.exports = [
  // Main process
  {
    mode: 'development',
    entry: './src/main/index.ts',
    target: 'electron-main',
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    externals: {
      'node-pty': 'commonjs node-pty',
      'electron': 'commonjs electron'
    },
    output: {
      path: path.resolve(__dirname, 'dist/main'),
      filename: 'index.js'
    }
  },
  // Preload script
  {
    mode: 'development',
    entry: './src/main/preload.ts',
    target: 'electron-preload',
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    output: {
      path: path.resolve(__dirname, 'dist/main'),
      filename: 'preload.js'
    }
  },
  // Renderer process
  {
    mode: 'development',
    entry: './src/renderer/renderer.ts',
    target: 'electron-renderer',
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    output: {
      path: path.resolve(__dirname, 'dist/renderer'),
      filename: 'renderer.js'
    }
  }
];