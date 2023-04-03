import Vue from 'vue';
import SvgIcon from '@/components/SvgIcon'; // svg component

// 全局注册SvgIcon
Vue.component('svg-icon', SvgIcon);
/*
  使用webpack的require.context来自动导入，https://webpack.js.org/guides/dependency-management/#require-context
  第一个入参是需要检索的目录
  第二个入参是是否检索子目录（默认true）
  第三个入参是匹配文件的正则表达式（默认/^\.\/.*$/）
  第四个入参是否同步执行（默认true）。
  返回值是一个上下文模块，它包含对该目录中所有模块的引用，有三个属性resolve、keys、id。
    resolve是一个函数，返回解析请求的模块 ID。
    keys是一个函数，它返回上下文模块可以处理的所有可能请求的数组。
  最重要的是这个上下文模块也是一个函数，这个函数类似于require(xxx)用于导入某个某块
*/
const req = require.context('./svg', false, /\.svg$/);
// 处理上下文模块。我们这里用到keys，它返回所有导入的模块名数组。然后又将某块名传递给requireContext，完成全部导入
const requireAll = requireContext => requireContext.keys().forEach(requireContext);
requireAll(req);

// 全部导入的完整写法
/* (function(requireContext) {
  // 拿到所有模块的名字。requireContext具有keys方法，用于获取该上下文里所有模块的模块名
  const keys = requireContext.keys();
  // 遍历
  keys.forEach(item => {
    // 依次导入每个模块。requireContext是上下文模块，它本身就具有导入的功能，入参就是模块名
    requireContext(item);
  });
})(requireContext); */
