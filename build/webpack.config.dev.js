const path = require('path')
const HTMLPlugin = require('html-webpack-plugin')
const baseConfig = require('./webpack.config.base')
const merge = require('webpack-merge')
// const webpack = require('webpack')
// const ExtractPlugin = require('extract-text-webpack-plugin')


const devServer = {  
  port: 8000,
  host: '0.0.0.0',
  contentBase: path.join(__dirname, '../dist'),
  hot: true
}

const plugins = [
  new HTMLPlugin({
    filename: 'index.html',
    template: path.join(__dirname, '../src/template.html')
  })
]

const config = merge(baseConfig, 
  {
    devtool: '#cheap-module-eval-source-map',
    devServer,
    plugins
  }
)

module.exports = config

