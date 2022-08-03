module.exports = {
    publicPath: "./",
    outputDir: "dist",
    assetsDir: "public",
    productionSourceMap: false,
    pages: {
        index: {
            entry: 'src/multiphaseplay_main.js',
            template: 'public/index.html',
            title: '多时相播放'
        },
        rasterquery: {
            entry: 'src/rasterquery_main.js',
            template: 'public/rasterquery.html',
            title: '栅格查询'
        },
        elevationgrad: {
            entry: 'src/elevationgrad_main.js',
            template: 'public/elevationgrad.html',
            title: '高程分级'
        }
    },
};