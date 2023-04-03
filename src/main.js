import Vue from 'vue';

import Cookies from 'js-cookie';

import 'normalize.css/normalize.css'; // A modern alternative to CSS resets

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
// import locale from 'element-ui/lib/locale/lang/en'; // lang i18n

import '@/styles/index.scss'; // global css

import App from './App';
import store from './store';
import router from './router';

import '@/icons'; // icon
import '@/permission'; // permission control

import xss from 'xss';
import directive from '@/directive/index.js';

// 在引入 Element 时，可以传入一个全局配置对象。该对象目前支持size 与 zIndex 字段。
// size 用于改变组件的默认尺寸，zIndex 设置弹框的初始 z-index（默认值：2000）
Vue.use(ElementUI, {
  size: Cookies.get('size') || 'medium' // set element-ui default size
});

// 去除“生产”提示
Vue.config.productionTip = false;

// 防止xss
Vue.prototype.xss = xss;

// 自定义指令
directive(Vue);

new Vue({
  el: '#app',
  router,
  store,
  beforeCreate() {
    // 安装全局事件总线，所有组件都能访问到$bus，并且所有组件都能使
    // 用到$bus的`$on()`和`$emit()`将自定义事件绑定到$bus身上
    Vue.prototype.$bus = this;
  },
  render: h => h(App)
});
