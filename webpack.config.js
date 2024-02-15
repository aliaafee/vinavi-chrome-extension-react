const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
    mode: 'production',
    entry: {
        popup: path.join(__dirname, 'src', 'pages', 'Popup', 'index.jsx')
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, "build"),
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                loader: 'html-loader',
                exclude: /node_modules/,
            },
            {
                test: /.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react"],
                    }
                }
            },
            {
                // look for .css or .scss files
                test: /\.(css|scss)$/,
                // in the `src` directory
                use: [
                    {
                        loader: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                        },
                    },
                ],
            }
        ],
    },
    resolve: {
        extensions: ['', '.js', '.jsx'],
    },
    plugins: [
        new CleanWebpackPlugin({
            verbose: false
        }),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: "src/manifest.json",
                    to: path.join(__dirname, 'build'),
                    force: true,
                    transform: function (content, path) {
                        // generates the manifest file using the package.json informations
                        return Buffer.from(
                            JSON.stringify({
                                version: process.env.npm_package_version,
                                ...JSON.parse(content.toString()),
                            })
                        );
                    }
                },
                {
                    from: "src/scripts/content.js",
                    to: path.join(__dirname, 'build'),
                    force: true
                },
                {
                    from: "src/scripts/background.js",
                    to: path.join(__dirname, 'build'),
                    force: true
                },
                {
                    from: "src/images/icon.svg",
                    to: path.join(__dirname, 'build', 'images'),
                    force: true
                },
                {
                    from: "src/images/icon16.png",
                    to: path.join(__dirname, 'build', 'images'),
                    force: true
                },
                {
                    from: "src/images/icon32.png",
                    to: path.join(__dirname, 'build', 'images'),
                    force: true
                },
                {
                    from: "src/images/icon48.png",
                    to: path.join(__dirname, 'build', 'images'),
                    force: true
                },
                {
                    from: "src/images/icon128.png",
                    to: path.join(__dirname, 'build', 'images'),
                    force: true
                },
                {
                    from: "src/images/external-link.svg",
                    to: path.join(__dirname, 'build', 'images'),
                    force: true
                }
            ]
        }),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'src', 'pages', 'Popup', 'index.html'),
            filename: 'popup.html',
            chunks: ['popup'],
            cache: false,
        })
    ],
    performance: {
        hints: false
    }
};