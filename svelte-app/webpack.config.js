const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const webpack = require('webpack')
const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

module.exports = {
	entry: {
		'build/bundle': ['./src/main.js']
	},
	resolve: {
		alias: {
			svelte: path.dirname(require.resolve('svelte/package.json')),
			process: "process/browser",
			buffer: "buffer"
		},
		extensions: ['.mjs', '.js', '.svelte'],
		mainFields: ['svelte', 'browser', 'module', 'main'],
		fallback: {
			"buffer": require.resolve("buffer/"),
			"path": require.resolve("path-browserify"),
			"crypto": require.resolve("crypto-browserify"),
			"stream": require.resolve("stream-browserify"),
			"zlib": require.resolve("browserify-zlib"),
			"assert": require.resolve("assert/")
		}
	},
	output: {
		path: path.join(__dirname, '/public'),
		filename: '[name].js',
		chunkFilename: '[name].[id].js'
	},
	module: {
		rules: [
			{
				test: /\.svelte$/,
				use: {
					loader: 'svelte-loader',
					options: {
						compilerOptions: {
							dev: !prod
						},
						emitCss: prod,
						hotReload: !prod
					}
				}
			},
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader'
				]
			},
			{
				// required to prevent errors from Svelte on Webpack 5+
				test: /node_modules\/svelte\/.*\.mjs$/,
				resolve: {
					fullySpecified: false
				}
			}
		]
	},
	mode,
	plugins: [
		new MiniCssExtractPlugin({
			filename: '[name].css'
		}),
		new webpack.ProvidePlugin({
			process: 'process/browser',
		}),
		new webpack.ProvidePlugin({
			Buffer: ['buffer', 'Buffer'],
		})
	],
	devtool: prod ? false : 'source-map',
	devServer: {
		hot: true
	}
};
