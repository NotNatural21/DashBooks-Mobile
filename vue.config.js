const { defineConfig } = require('@vue/cli-service');
const Dotenv = require('dotenv-webpack');
module.exports = defineConfig({
    configureWebpack: {
        experiments: {
            topLevelAwait: true,
        },
        plugins: [
            new Dotenv()
        ]
    },
})
