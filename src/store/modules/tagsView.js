const state = {
  visitedViews: [], // 用户访问过的页面 就是标签栏导航显示的一个个 tag 数组集合
  cachedViews: [] // 实际 keep-alive 的路由
};

const mutations = {
  // 添加访问的页面
  ADD_VISITED_VIEW: (state, view) => {
    // 已存在就不用添加了
    if (state.visitedViews.some(v => v.path === view.path)) return;
    // 添加，如果title没有就用'no-name'替代
    state.visitedViews.push(
      Object.assign({}, view, {
        title: view.meta.title || 'no-name'
      })
    );
  },
  // 添加新缓存的路由
  ADD_CACHED_VIEW: (state, view) => {
    // 已缓存过就不用缓存了
    if (state.cachedViews.includes(view.name)) return;
    // 没有被noCache限制才能缓存，noCache表示不需要缓存
    if (!view.meta.noCache) {
      state.cachedViews.push(view.name);
    }
  },
  // 删除已访问的页面
  DEL_VISITED_VIEW: (state, view) => {
    for (const [i, v] of state.visitedViews.entries()) {
      if (v.path === view.path) {
        state.visitedViews.splice(i, 1);
        break;
      }
    }
  },
  // 删除已缓存的路由
  DEL_CACHED_VIEW: (state, view) => {
    const index = state.cachedViews.indexOf(view.name);
    index > -1 && state.cachedViews.splice(index, 1);
  },
  // 删除其他的访问页面
  DEL_OTHERS_VISITED_VIEWS: (state, view) => {
    state.visitedViews = state.visitedViews.filter(v => {
      return v.meta.affix || v.path === view.path;
    });
  },
  // 删除其他的缓存路由
  DEL_OTHERS_CACHED_VIEWS: (state, view) => {
    const index = state.cachedViews.indexOf(view.name);
    if (index > -1) {
      state.cachedViews = state.cachedViews.slice(index, index + 1);
    } else {
      // if index = -1, there is no cached tags
      state.cachedViews = [];
    }
  },
  // 删除所有的访问页面
  DEL_ALL_VISITED_VIEWS: state => {
    // keep affix tags
    const affixTags = state.visitedViews.filter(tag => tag.meta.affix);
    state.visitedViews = affixTags;
  },
  // 删除所有的缓存路由
  DEL_ALL_CACHED_VIEWS: state => {
    state.cachedViews = [];
  },
  // 更新所有的访问页面
  UPDATE_VISITED_VIEW: (state, view) => {
    for (let v of state.visitedViews) {
      if (v.path === view.path) {
        v = Object.assign(v, view);
        break;
      }
    }
  }
};

const actions = {
  // 添加一个访问的页面以及它的缓存路由
  addView({ dispatch }, view) {
    dispatch('addVisitedView', view);
    dispatch('addCachedView', view);
  },
  // 添加访问的页面
  addVisitedView({ commit }, view) {
    commit('ADD_VISITED_VIEW', view);
  },
  // 添加新缓存的路由
  addCachedView({ commit }, view) {
    commit('ADD_CACHED_VIEW', view);
  },
  // 删除一个已访问的页面以及它的缓存路由
  delView({ dispatch, state }, view) {
    return new Promise(resolve => {
      dispatch('delVisitedView', view);
      dispatch('delCachedView', view);
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      });
    });
  },
  // 删除已访问的页面
  delVisitedView({ commit, state }, view) {
    return new Promise(resolve => {
      commit('DEL_VISITED_VIEW', view);
      resolve([...state.visitedViews]);
    });
  },
  // 删除已缓存的路由
  delCachedView({ commit, state }, view) {
    return new Promise(resolve => {
      commit('DEL_CACHED_VIEW', view);
      resolve([...state.cachedViews]);
    });
  },
  // 删除其他访问页面以及缓存路由
  delOthersViews({ dispatch, state }, view) {
    return new Promise(resolve => {
      dispatch('delOthersVisitedViews', view);
      dispatch('delOthersCachedViews', view);
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      });
    });
  },
  // 删除其他的访问页面
  delOthersVisitedViews({ commit, state }, view) {
    return new Promise(resolve => {
      commit('DEL_OTHERS_VISITED_VIEWS', view);
      resolve([...state.visitedViews]);
    });
  },
  // 删除其他的缓存路由
  delOthersCachedViews({ commit, state }, view) {
    return new Promise(resolve => {
      commit('DEL_OTHERS_CACHED_VIEWS', view);
      resolve([...state.cachedViews]);
    });
  },
  // 删除所有访问页面以及缓存路由
  delAllViews({ dispatch, state }, view) {
    return new Promise(resolve => {
      dispatch('delAllVisitedViews', view);
      dispatch('delAllCachedViews', view);
      resolve({
        visitedViews: [...state.visitedViews],
        cachedViews: [...state.cachedViews]
      });
    });
  },
  // 删除所有的访问页面
  delAllVisitedViews({ commit, state }) {
    return new Promise(resolve => {
      commit('DEL_ALL_VISITED_VIEWS');
      resolve([...state.visitedViews]);
    });
  },
  // 删除所有的缓存路由
  delAllCachedViews({ commit, state }) {
    return new Promise(resolve => {
      commit('DEL_ALL_CACHED_VIEWS');
      resolve([...state.cachedViews]);
    });
  },
  // 更新所有的访问页面
  updateVisitedView({ commit }, view) {
    commit('UPDATE_VISITED_VIEW', view);
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
