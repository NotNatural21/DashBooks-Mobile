const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
    configureWebpack: {
        experiments: {
            topLevelAwait: true,
        }
    }
})
