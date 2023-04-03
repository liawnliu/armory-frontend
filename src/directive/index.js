import btnAuth from './btn-auth';
// 注册所有自定义指令
const install = Vue => {
  Vue.directive('btn-auth', btnAuth);
};
export default install;
