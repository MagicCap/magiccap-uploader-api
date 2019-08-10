module.exports = {
    entry: ".",
    module: {
        rules: [
            {
                test: require.resolve("."),
                use: [
                    {
                        loader: "expose-loader",
                        options: "MagicCap",
                    },
                ],
            },
        ],
    },
    mode: "production",
    output: {
        filename: "uploader_api.min.js",
        path: __dirname,
    },
}
