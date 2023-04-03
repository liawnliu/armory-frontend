import router from './router';
import store from './store';
import { Message } from 'element-ui';
import NProgress from 'nprogress'; // progress bar
import 'nprogress/nprogress.css'; // progress bar style
import { getToken } from '@/utils/auth'; // get token from cookie
import getPageTitle from '@/utils/get-page-title';

NProgress.configure({ showSpinner: false }); // NProgress Configuration

// 不需要进行重定向的路由白名单
const whiteList = ['/login', '/auth-redirect'];

// 全局前置路由守卫(常用于设置路由的访问权限)；to是切换到哪个路由，from是切换前的路由；next是“放行”
router.beforeEach(async(to, from, next) => {
  // 进度条-开始
  NProgress.start();
  // 根据路由里的title来修改文档标题
  document.title = getPageTitle(to.meta.title);
  // 从cookie里获取登录用户的token
  const hasToken = getToken();
  // 如果获取到了token
  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' }); // 如果已经登录就重定向到主页
      NProgress.done();
    } else {
      try {
        // 有token，但没有用户信息，就向服务器获取
        (!store.getters.user) && await store.dispatch('user/getInfo');
        // 有token和用户信息，但没有可访问的路由就向服务器获取
        const menuList = store.getters.menuList;
        if (!menuList || !menuList.length) {
          await store.dispatch('user/getMenuList');
          // replace设为true，表示to这条路由信息在history中replace了from这条路由信息
          next({ ...to, replace: true });
        }
        // 有token、用户信息、可访问路由表，但是对应跳转路由不存在，就跳到404
        if (to.name != null && to.name !== 'Root' && to.path === '/') {
          // 使用name的方式跳转，如果路由不存在，会跳到'/'而不是404，所以这里我们手动跳到404
          next('/404');
        } else {
          next();
        }
      } catch (error) {
        console.warn('permission error', error);
        // 获取不到用户信息或者拿到的菜单信息有问题，就重置token，并跳转到登录页
        await store.dispatch('user/resetToken');
        Message.error(error.message || 'Has Error');
        next(`/login?redirect=${to.fullPath}`);
        NProgress.done();
      }
    }
  } else {
    // 没有token，免登录页面白名单里有该页面的话就放行，否则重定向到登录页面
    if (whiteList.includes(to.path)) {
      next();
    } else {
      // 跳转登录
      next(`/login?redirect=${to.fullPath}`);
      NProgress.done();
    }
  }
});
router.afterEach((to, from) => {
  NProgress.done();
});
