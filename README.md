# 说明

## 项目目录一览

```js
armory-frontend
    ├── .github                    // github相关  
    ├── build                      // 构建相关 
    │   └── index.js               // webpack配置相关
    ├── docs                       // 项目文档  
    ├── mock                       // 项目mock 模拟数据
    ├── plop-templates             // 基本模板
    ├── public                     // 静态资源 vue的本地预览入口，webpack不会编译它，但会复制到dist
    ├── src                        // 源代码
    │   ├── api                    // 所有接口请求
    │   ├── assets                 // 主题 字体等静态资源，webpack会编译它
    │   ├── components             // 全局公用组件（非路由组件）
    │   ├── directive              // 全局指令
    │   ├── filtres                // 全局 filter
    │   ├── icons                  // 项目所有 svg icons
    │   ├── layout                 // 全局 layout
    │   ├── router                 // 路由
    │   ├── store                  // 全局 store管理
    │   ├── styles                 // 全局样式
    │   ├── utils                  // 全局公用方法
    │   ├── vendor                 // 公用vendor
    │   ├── views                  // views 所有页面（路由组件）
    │   ├── App.vue                // 入口页面
    │   ├── main.js                // 入口 加载组件 初始化等
    │   ├── permission.js          // 权限管理
    │   └── settings.js            // 项目设置，标签title，LOGO展示，是否固定header
    ├── tests                      // 本地测试
    ├── .editorconfig              // 编辑器配置项
    ├── .babelrc                   // babel-loader 配置
    ├── .env.development           // 开发环境变量配置
    ├── .env.production            // 生产环境变量配置
    ├── .env.staging               // 测试环境变量配置
    ├── .eslintignore              // eslint 忽略项
    ├── .eslintrc.js               // eslint 配置项
    ├── .gitignore                 // git 忽略项
    ├── .travis.yml                // 自动化CI配置
    ├── babel.config.js            // babel编译配置项
    ├── jest.config.js             // jest测试配置项
    ├── jsconfig.json              // js配置项
    ├── LICENSE                    // LICENSE
    ├── package.json               // package.json
    ├── postcss.config.js          // css编译配置项
    ├── README.md                  // 说明文件
    └── vue.config.js              // vue-cli 配置

```