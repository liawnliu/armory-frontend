import { login, logout, getInfo, getMenuList } from '@/api/user';
import { getToken, setToken, removeToken, setTokenTime, clearStorage, removeTokenTime } from '@/utils/auth';
import { resetRouter, toAddRoutes } from '@/router';
import cacheList from '@/config/cacheList';

export function hasPermission(data = {}, isRoute = true) {
  const code = (isRoute && data.meta) ? data.meta.code : data.code;
  if (!code) {
    console.warn('该路由信息的code为空！');
    return false;
  }
  const auth = state.auth;
  return auth.includes(code);
}
/*
  直接从“@/”开始的话，会出现“Syntax Error: SassError: Undefined variable.”报错
  所以我们从“@/views/”开始，至于第一层次的Layout，就用() => import('@/layout')
  而不是在顶部import Layout from '@/layout'，因为它可能会影响到原本home路由里的component
  暂时不知线上环境能否用import()，如果不能用就用环境变量加上
  resolve => require([`@/views/${resolvePath}.vue`], resolve);即可
*/
export function getResolve(data = {}, isRoute = true) {
  const component = isRoute ? data.component : data.url;
  const parentId = isRoute ? data.meta.parentId : data.parentId;
  // component的值是layout或者路由是第一级，就用() => import('@/layout')
  if (/\/?layout(\/index)?(.vue)?/.test(component) || parentId === '0') {
    return () => import('@/layout');
  }
  // 其他层级用@/views/xxx
  const resolvePath = component.replace(/^\/?views\//, '');
  return () => import(`@/views/${resolvePath}`);
}
function setRedirect(data) {
  if (data.type === 0 && data.children && data.children[0] && data.children[0].type === 1) {
    return { name: data.children[0].name };
  } else {
    return '';
  }
}
// 从服务端获取resourceList资源列表后，我们需要处理成Vue可访问的路由表
const generateAccessRoutes = resourceList => {
  // 存放可访问路由的容器
  const menuList = [];
  // 用来存储每个resource的path。主要用于路由跳转
  const handleList = (resList, accessRoutes) => {
    for (let index = 0; index < resList.length; index++) {
      const item = resList[index];
      // console.log('item', item);
      // 是按钮或者没有权限就下一个
      if (item.type === 2 || !hasPermission(item, false)) continue;
      const breadCrumbList = item.breadCrumb ? JSON.parse(item.breadCrumb) : null;
      // 转换成Vue的路由对象
      const newItem = {
        path: item.parentId === '0' ? item.path : item.path.replace(/\/?/, ''), // 多级路由的path开头没有/
        component: getResolve(item, false), // 根据url获取Vue里对应的组件
        name: item.name, // 因为用了TagsView，要确保路由的name和Vue组件的name保持一致
        meta: {
          title: item.label,
          code: item.code,
          showInSidebar: item.showInSidebar,
          breadCrumbList,
          noCache: !cacheList.includes(item.name) // noCache表示二级路由的keep-alive不缓存。cacheList存储的是要缓存的组件Name
        },
        hidden: !item.showInSidebar,
        alwaysShow: true, // 一直显示根路由
        redirect: setRedirect(item), // 对于目录来说，要么设置'noRedirect'要么设置为它children里的第一个的name
        children: null
      };
      // 可访问路由正常push
      accessRoutes.push(newItem);
      // children还有数据就递归
      if (item.children && item.children.length) {
        handleList(item.children, newItem.children = []);
      }
    }
  };
  handleList(resourceList, menuList);
  return menuList;
};

const getDefaultState = () => {
  return {
    token: getToken(),
    user: '',
    avatar: '',
    auth: [],
    menuList: [] // 可访问的路由表
  };
};

const state = getDefaultState();

const mutations = {
  RESET_STATE: state => {
    Object.assign(state, getDefaultState());
  },
  SET_TOKEN: (state, token) => {
    state.token = token;
  },
  SET_USER: (state, user) => {
    state.user = user;
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar;
  },
  SET_ROUTES: (state, menuList) => {
    state.menuList = menuList;
  },
  SET_AUTH: (state, auth) => {
    state.auth = auth;
  }
};

const actions = {
  async login({ commit }, userInfo) {
    try {
      // 解构出用户名和密码 md5(password)
      const { username, password, code } = userInfo;
      const { content } = await login({ username: username.trim(), password, code });
      const { token, expireTime } = content;
      // 把后端返回的token存到vuex中
      commit('SET_TOKEN', token);
      // 把后端返回的token存到cookies里面
      setToken(token);
      // 设置token过期时间
      setTokenTime(expireTime);
    } catch (error) {
      return Promise.reject(error);
    }
  },
  async getInfo({ commit, state }) {
    try {
      const { content } = await getInfo();
      if (!content) return Promise.reject(new Error('获取当前用户信息失败！'));
      commit('SET_USER', content);
      commit('SET_AVATAR', 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif');
      return content;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  // 获取当前用户拥有的资源列表
  async getMenuList({ commit }) {
    try {
      const { content } = await getMenuList();
      if (content) {
        console.log('getMenuList content', content);
        // 把auth存到store里面
        commit('SET_AUTH', content.authList);
        // 用这个列表去过滤asyncRoutes，最后留下真正可访问的路由表
        const menuList = generateAccessRoutes(content.menuList);
        console.log('menuList', menuList);
        // 404必须放在所有路由的后面
        menuList.push({ path: '*', name: 'NotFound', redirect: '/404', hidden: true });
        commit('SET_ROUTES', menuList);
        toAddRoutes(menuList);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  },
  updateUserAndResource({ dispatch }, type) {
    switch (type) {
    case 'user':
      dispatch('getInfo');
      break;
    case 'resource':
      resetRouter();
      dispatch('getMenuList');
      break;
    default:
      dispatch('getInfo');
      resetRouter();
      dispatch('getMenuList');
    }
  },
  async logout({ commit, state }) {
    try {
      await logout(state.token);
      commit('SET_USER', null);
      commit('SET_AVATAR', '');
      removeToken();
      resetRouter();
      commit('RESET_STATE');
    } catch (error) {
      removeToken();
      resetRouter();
      commit('RESET_STATE');
      return Promise.reject(error);
    }
  },
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '');
      commit('SET_AUTH', []);
      removeToken();
      clearStorage();
      removeTokenTime();
      resolve();
    });
  }
};
export default {
  namespaced: true,
  state,
  mutations,
  actions
};
