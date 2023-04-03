import Vue from 'vue';

const state = {
  currentDrawer: '', // 必须是组件名，因为会用到<component :is="xxx" />
  drawers: {} // 存储所有的抽屉，key是抽屉名（组件名），value是抽屉信息对象
};

const mutations = {
  SET_DRAWER: (state, data) => {
    Vue.set(state.drawers, data.name, { ...data });
  },
  SWITCH_DRAWER_BTN: (state, data) => {
    state.drawers[data.name].isShow = data.status;
  },
  DELETE_DRAWER: (state, data) => {
    Vue.delete(state.drawers, data);
  },
  CLEAR_DRAWER: state => {
    state.drawers = {};
  },
  CHANGE_CURRENT_DRAWER: (state, data) => {
    state.currentDrawer = data;
  }
};

const actions = {
  setDrawer({ commit }, data) {
    console.log('setDrawer data', data);
    // data必须是个对象，并且具有name属性，name将作为drawers对象的key，而value将是data本身
    if (data != null && typeof data === 'object' &&
      Object.prototype.hasOwnProperty.call(data, 'name') && typeof data.name === 'string') {
      commit('SET_DRAWER', data);
    } else {
      console.warn('修改drawers中的某项，需要传递一个对象，并且它要具有name属性');
    }
  },
  switchDrawerBtn({ commit }, data) {
    console.log('switchDrawerBtn data', data);
    if (data != null && typeof data === 'object' &&
      Object.prototype.hasOwnProperty.call(data, 'name') && typeof data.name === 'string' &&
      Object.prototype.hasOwnProperty.call(data, 'status') && typeof data.status === 'boolean') {
      if (data.name && Object.prototype.hasOwnProperty.call(state.drawers, data.name)) {
        commit('SWITCH_DRAWER_BTN', data);
      } else {
        console.warn(`显示/隐藏当前抽屉的把手，但drawers中没有找到${data.name}这一项`);
      }
    } else {
      console.warn(`显示/隐藏当前抽屉的把手，但data传参有问题：${data}`);
    }
  },
  deleteDrawer({ commit }, data) {
    if (typeof data === 'string') {
      if (Object.prototype.hasOwnProperty.call(state.drawers, data)) {
        commit('DELETE_DRAWER', data);
      } else {
        console.warn(`删除失败，drawers中没有找到${data}这一项`);
      }
    } else {
      console.warn('删除drawers中的某项，需要传递该项的key，也就是一个字符串');
    }
  },
  clearDrawer({ commit }) {
    commit('CLEAR_DRAWER');
  },
  changeCurrentDrawer({ commit }, data) {
    if (typeof data === 'string') {
      if (data === '' || Object.prototype.hasOwnProperty.call(state.drawers, data)) {
        commit('CHANGE_CURRENT_DRAWER', data);
      } else {
        console.warn(`切换当前抽屉，但drawers中没有找到${data}这一项`);
      }
    } else {
      console.warn('切换当前抽屉，需要传递对应组件的name，也就是一个字符串');
    }
  }
};

export default {
  namespaced: true,
  state,
  mutations,
  actions
};
