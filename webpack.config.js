const path = require('path');

module.exports = {
    entry: './scripts/init.js', // Entry point
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'development',
    devServer: {
        static: './dist',
        open: true,
    },
};
