const getters = {
  sidebar: state => state.app.sidebar,
  size: state => state.app.size,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  user: state => state.user.user,
  menuList: state => state.user.menuList,
  auth: state => state.user.auth,
  visitedViews: state => state.tagsView.visitedViews
};

export default getters;
