module.exports = (ctx) => ({
  map: { ... ctx.options.map, sourcesContent: false },
  plugins: [
      require("postcss-import-styled-js")(),
      require('postcss-preset-env')({
        stage: 4
      }),
      require("postcss-import-ext-glob")(),
      require("postcss-import")(),
      require("postcss-url")({
        url: "rebase",
        basePath: ctx.options.base,
        assetsPath: ctx.options.dist
      }),
      require("postcss-nested")(),
      require("cssnano")()
  ]
});
