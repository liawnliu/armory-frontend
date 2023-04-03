'use strict';
const path = require('path');
const defaultSettings = require('./src/settings.js');

function resolve(dir) {
  return path.join(__dirname, dir);
}

const name = defaultSettings.title || 'vue Admin Template'; // page title

// If your port is set to 80,
// use administrator privileges to execute the command line.
// For example, Mac: sudo npm run
// You can change the port by the following methods:
// port = 9528 npm run dev OR npm run dev --port = 9528
const port = process.env.port || process.env.npm_config_port || 9528; // dev port

// All configuration item explanations can be find in https://cli.vuejs.org/config/
module.exports = {
  /**
   * You will need to set publicPath if you plan to deploy your site under a sub path,
   * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
   * then publicPath should be set to "/bar/".
   * In most cases please use '/' !!!
   * Detail: https://cli.vuejs.org/config/#publicpath
   */
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: false,
  devServer: {
    port: port,
    open: true,
    overlay: {
      warnings: false,
      errors: true
    },
    proxy: {
      // 将部分接口代理到本地服务器9090
      [process.env.VUE_APP_BASE_API]: {
        target: 'http://192.168.43.209:8081', // API服务器的地址'http://192.168.0.166:9090'
        ws: true, // 代理websockets
        changeOrigin: true, // 是否跨域
        pathRewrite: {
          // 这是一个正则表达式，例如将以 '/api' 转接为 '/'
          ['^' + process.env.VUE_APP_BASE_API]: '/'
        }
      },
      // 将部分接口代理到本地服务器3004，但我们用的是json-server来mock数据的，它可能不是用的真实本地IP，
      // 要确认好是192.168.0.xxx还是127.0.0.xxx。
      [process.env.VUE_APP_BASE_API_MOCK]: {
        target: 'http://192.168.0.166:3005', // http://127.0.0.1:3005 或 http://192.168.0.166:3005
        ws: true, // 代理websockets
        changeOrigin: true, // 是否跨域
        pathRewrite: {
          // 这是一个正则表达式，例如将以 '/api' 转接为 '/'
          ['^' + process.env.VUE_APP_BASE_API_MOCK]: '/'
        }
      }
    }
  },
  configureWebpack: {
    // provide the app's title in webpack's name field, so that
    // it can be accessed in index.html to inject the correct title.
    devtool: 'source-map',
    name: name,
    resolve: {
      alias: {
        '@': resolve('src')
      }
    }
  },
  chainWebpack(config) {
    // 预加载，加快首屏展示，
    config.plugin('preload').tap(() => [
      {
        rel: 'preload',
        // to ignore runtime.js
        // https://github.com/vuejs/vue-cli/blob/dev/packages/@vue/cli-service/lib/config/app.js#L171
        fileBlacklist: [/\.map$/, /hot-update\.js$/, /runtime\..*\.js$/],
        include: 'initial'
      }
    ]);

    // prefetch表示页面加载完成后，利用空闲时间提前获取用户未来可能会访问的内容。我们不需要这样做，delete它
    config.plugins.delete('prefetch');

    // 不是所有的svg都用做icon的（SvgIcon组件），那就没必要打包'src/icons'里的svg，用默认的url-loader打包即可。
    config.module.rule('svg').exclude.add(resolve('src/icons')).end();
    // 对于要用在SvgIcon组件里的svg（只限于'src/icons'），则需要使用'svg-sprite-loader'来打包它们，形成一个雪碧图
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end();

    config.when(process.env.NODE_ENV !== 'development', config => {
      config
        .plugin('ScriptExtHtmlWebpackPlugin')
        .after('html')
        .use('script-ext-html-webpack-plugin', [
          {
            // `runtime` must same as runtimeChunk name. default is `runtime`
            inline: /runtime\..*\.js$/
          }
        ])
        .end();
      config.optimization.splitChunks({
        chunks: 'all',
        cacheGroups: {
          libs: {
            name: 'chunk-libs',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            chunks: 'initial' // only package third parties that are initially dependent
          },
          elementUI: {
            name: 'chunk-elementUI', // split elementUI into a single package
            priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
            test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
          },
          commons: {
            name: 'chunk-commons',
            test: resolve('src/components'), // can customize your rules
            minChunks: 3, //  minimum common number
            priority: 5,
            reuseExistingChunk: true
          }
        }
      });
      // https:// webpack.js.org/configuration/optimization/#optimizationruntimechunk
      config.optimization.runtimeChunk('single');
      // 覆盖v-html，解决xss问题。https://blog.csdn.net/zhaoletf/article/details/115101293
      config.module
        .rule('vue')
        .use('vue-loader')
        .loader('vue-loader')
        .tap(options => {
          options.compilerOptions.directives = {
            html(node, directiveMeta) {
              (node.props || (node.props = [])).push({
                name: 'innerHTML',
                value: `xss(_s(${directiveMeta.value}))`
              });
            }
          };
          return options;
        });
    });
  }
};
