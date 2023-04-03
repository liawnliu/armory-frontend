import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

/* 一级路由的UI，包含顶部导航栏、左侧侧边栏 */
import Layout from '@/layout';
console.log('Layout', Layout);

/**
 * 通用路由表
 * 如首页和登录页和一些不用权限的公用页面
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/',
    name: 'Root',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/index'),
        meta: { title: 'Armory' }
      }
    ]
  }
];

// 实例化vue的时候只挂载constantRouter
const createRouter = () =>
  new Router({
    // mode: 'history', // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  });

const router = createRouter();

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher; // reset router
}
export function toAddRoutes(routes) {
  router.addRoutes(routes);
}

export default router;
