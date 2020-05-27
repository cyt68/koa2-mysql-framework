module.exports = {
    dev: {
        target: 'http://apis.juhe.cn',
        changeOrigin: true,
        pathRewrite:{
            '^/old/api/*': ''
          }
    },
    uat: {
        target: 'http://localhost:80',
        changeOrigin: true,
        pathRewrite:{
            '^/old/api/*': ''
          }
    },
    prod: {
        target: 'http://localhost:80',
        changeOrigin: true,
        pathRewrite:{
            '^/old/api/*': ''
          }
    }
}