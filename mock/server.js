const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db.js'); // 数据存储中心
const routes = require('./routes.json');
const axios = require('axios');
const nanoid = require('nanoid');

// 初始化express服务
const server = express();

// 处理传输的post数据格式
server.use(bodyParser.json());
server.use(
  bodyParser.urlencoded({
    extended: false, // 拓展模式
    limit: 2 * 1024 * 1024 // 限制2m
  })
);
// /api/sysUser/image 验证码图片
server.post('/api/sysUser/image', function(req, res) {
  res.send('');
});
// 从mock服务发送ajax请求到本地9090服务上，获取用户列表
function login({ username, password }) {
  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: 'http://localhost:8081/user/login',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        loginName: username,
        password
      }
    }).then(res => {
      resolve(res);
    }).catch(err => {
      reject(err);
    });
  });
}
// /api/user/login 登录
server.post('/api/user/login', async function(req, res) {
  try {
    const { data } = await login(req.body);
    // console.log('data', data);
    if (!data.success) {
      res.send({ code: 500, message: '登录失败', content: null });
      return;
    }
    const content = data.content;
    content.roleId = 1;
    // 更新mock服务里的nowUser
    db['systemManager_nowUser'] = content;
    // 更新mock服务里的token
    const token = db['systemManager_token'];
    token.token = content.token;
    // 返回给前端token以及expireTime以及user的id
    res.send({
      success: true,
      message: 'success',
      content: {
        expireTime: new Date().getTime(),
        id: content.id,
        token: token.token
      }
    });
  } catch ({ message }) {
    res.send({ code: 500, message, content: null });
  }
});
// /api/sysUser/refreshToken 刷新token
/* server.post('/api/sysUser/refreshToken', function(req, res) {
  const route = routes[req.path];
  const token = route ? db[route] : null;
  token.token = '' + tokenNum++;
  res.send({
    success: true,
    message: 'success',
    data: {
      expireTime: new Date().getTime(),
      token: token.token
    }
  });
}); */
// /api/sysUser/getInfo 获取当前用户信息
server.get('/api/sysUser/getInfo', function(req, res) {
  const route = routes[req.path];
  const nowUser = route ? db[route] : null;
  if (nowUser.id == null) {
    res.send({ code: 500, message: '当前未登录！', content: null });
    return;
  }
  const roleList = db['systemManager_roleList'].list;
  const menuList = db['systemManager_menuList'];
  let menuId = null;
  for (let index = 0; index < roleList.length; index++) {
    const item = roleList[index];
    if (item.id === nowUser.roleId) {
      menuId = item.menuId;
      break;
    }
  }
  if (menuId == null) {
    res.send({ code: 500, message: '该用户找不到角色！', content: null });
    return;
  }
  const roles = [];
  const handleList = list => {
    list.forEach(item => {
      if (menuId.includes(item.id)) { // 勾选了，就把code放到roles里
        roles.push(item.code);
      }
      if (item.children && item.children.length) {
        handleList(item.children);
      }
    });
  };
  handleList(menuList);
  res.send({
    success: true,
    message: 'success',
    content: { ...nowUser, roles }
  });
});
// /api/sysUser/getMenuList 获取资源列表（按钮除外）
server.get('/api/sysUser/getMenuList', function(req, res) {
  const route = routes[req.path];
  const menuList = route ? db[route] : null;
  const newMenuList = [];
  const handleList = (list, newList) => {
    for (let index = 0; index < list.length; index++) {
      const item = list[index];
      if (item.type === 2) continue; // 跳过按钮
      const newItem = {
        path: item.level === 1 ? item.path : item.path.replace(/\/?/, ''),
        component: item.url,
        name: item.name,
        meta: {
          title: item.label,
          level: item.level,
          code: item.code // 将roles改为code
        }
      };
      if (item.children && item.children.length) {
        handleList(item.children, newItem.children = []);
      }
      newList.push(newItem);
    }
  };
  handleList(menuList, newMenuList);
  res.send({
    success: true,
    message: 'success',
    content: newMenuList
  });
});
// 从mock服务发送ajax请求到本地9090服务上，获取用户列表
function loginOut() {
  return new Promise((resolve, reject) => {
    axios({
      method: 'get',
      url: 'http://localhost:9090/sys/user/page/logout'
    }).then(res => {
      resolve(res);
    }).catch(err => {
      reject(err);
    });
  });
}
// /api/sysUser/loginOut 登出
server.post('/api/sysUser/loginOut', function(req, res) {
  const route = routes[req.path];
  db[route] = null;
  loginOut();
  res.send({ success: true, message: 'success', content: null });
});

// /api/user/list 获取用户列表
server.get('/api/user/list', function(req, res) {
  const userList = db['systemManager_userList'];
  if (!userList || !userList.list) {
    res.send({ code: 500, message: '获取用户列表失败', content: null });
    return;
  }
  console.log('req.query', req.query);
  let result = null;
  if (req.query.deptId == null || req.query.deptId === '') {
    result = userList.list.filter(item => item.deptId === 1); // 顶级
  } else {
    result = userList.list.filter(item => String(item.deptId) === String(req.query.deptId));
  }
  const { currentPage, pageSize, flag, totalNums, keyword } = userList;
  const resData = { currentPage, pageSize, flag, totalNums, keyword, list: result };
  res.send({ success: true, message: 'success', content: resData });
});
// 新增用户
server.post('/api/user', function(req, res) {
  const route = routes[req.path];
  const userList = route ? db[route] : null;
  const contain = userList.list.some(item => item.loginName === req.body.loginName);
  if (contain) {
    res.send({ code: 500, message: '用户名重复！', content: null });
    return;
  }
  const newUser = {
    id: nanoid.nanoid(),
    ...req.body
  };
  let role = null;
  const roleList = db['systemManager_roleList'].list;
  for (let index = 0; index < roleList.length; index++) {
    const item = roleList[index];
    if (item.id === newUser.roleId) {
      role = item;
    }
  }
  if (!role) {
    res.send({ code: 500, message: '找不到该用户对应的新角色', content: null });
    return;
  }
  newUser.roleName = role.name;
  userList.list.push(newUser);
  db[route] = userList;
  res.send({ success: true, message: '用户新增成功！', content: null });
});
// 编辑用户
server.put('/api/user', function(req, res) {
  const route = routes[req.path];
  const userList = route ? db[route] : null;
  let user = null;
  for (let index = 0; index < userList.list.length; index++) {
    const item = userList.list[index];
    if (item.id === req.body.id) {
      user = item;
    }
  }
  if (!user) {
    res.send({ code: 500, message: '找不到该用户', content: null });
    return;
  }
  const roleId = user.roleId; // 临时保存原user的角色id
  Object.assign(user, req.body); // 用新信息覆盖user
  if (roleId !== req.body.roleId) { // 查看角色信息是否变化
    let role = null;
    const roleList = db['systemManager_roleList'].list;
    for (let index = 0; index < roleList.length; index++) {
      const item = roleList[index];
      if (item.id === req.body.roleId) {
        role = item;
      }
    }
    if (!role) {
      res.send({ code: 500, message: '找不到该用户对应的新角色', content: null });
      return;
    }
    // 更新用户的角色信息
    user.roleId = req.body.roleId; // 其实在Object.assign(user, req.body)就已经覆盖了
    user.roleName = role.name; // 只需要更新roleName
  }
  db[route] = userList;
  res.send({ success: true, message: 'success', content: null });
});
// 删除用户
server.delete('/api/user/:id', function(req, res) {
  const userList = db['systemManager_userList'];
  if (req.params.id == null) {
    res.send({ code: 500, message: '删除用户失败！入参有问题！', content: null });
    return;
  }
  let rlt = false;
  for (let index = 0; index < userList.list.length; index++) {
    const item = userList.list[index];
    if (item.id === req.params.id) {
      userList.list.splice(index, 1);
      rlt = true;
      break;
    }
  }
  if (!rlt) {
    res.send({ code: 500, message: '删除用户失败！找不到该用户！', content: null });
    return;
  }
  res.send({ success: true, message: '删除用户成功！', content: null });
});

// /api/dept/list 获取部门列表
server.get('/api/dept/list', function(req, res) {
  const route = routes[req.path];
  const deptList = route ? db[route] : null;
  if (!deptList) {
    res.send({ code: 500, message: '获取部门列表失败', content: null });
    return;
  }
  res.send({ success: true, message: 'success', content: deptList });
});
// /api/dept/parent 获取父级部门
server.get('/api/dept/parent', function(req, res) {
  const deptList = db['systemManager_deptList'] || [];
  const departList = [
    {
      'id': 0,
      'pid': -1,
      'likeId': null,
      'parentName': null,
      'manager': null,
      'name': '顶级部门',
      'deptCode': null,
      'deptAddress': null,
      'deptPhone': null,
      'orderNum': null,
      'open': null,
      'children': deptList
    }
  ];
  res.send({ success: true, message: 'success', content: departList });
});
// 新增机构
server.post('/api/dept', function(req, res) {
  const dept = req.body;
  const deptList = db['systemManager_deptList'] || [];
  let result = false;
  const handleList = list => {
    for (let index = 0; index < list.length; index++) {
      const item = list[index];
      // 找到父节点
      if (item.id === dept.pid) {
        // 用nanoid生成新id
        dept.id = nanoid.nanoid();
        // 将新部门添加到父节点的children里
        item.children.push(dept);
        // 按照orderNum升序排序
        item.children.sort((v1, v2) => v1.orderNum - v2.orderNum);
        result = true;
        break;
      } else if (item.children && item.children.length) {
        handleList(item.children);
      }
    }
  };
  handleList(deptList);
  db['systemManager_deptList'] = deptList;
  if (result) {
    res.send({ success: true, message: '新增机构成功！', content: null });
  } else {
    res.send({ code: 500, message: '新增机构失败！', content: null });
  }
});
const deleteDept = (deptList, id) => {
  let result = false;
  const handleList = list => {
    for (let index = 0; index < list.length; index++) {
      const item = list[index];
      if (String(item.id) === String(id)) {
        list.splice(index, 1);
        result = true;
        break;
      } else if (item.children && item.children.length) {
        handleList(item.children);
      }
    }
  };
  handleList(deptList);
  return {
    deptList,
    result
  };
};
server.delete('/api/dept/:id', function(req, res) {
  const deptList = db['systemManager_deptList'] || [];
  const rlt = deleteDept(deptList, req.params.id);
  db['systemManager_deptList'] = rlt.deptList;
  if (rlt.result) {
    res.send({ success: true, message: '删除机构成功！', content: null });
  } else {
    res.send({ code: 500, message: '删除机构失败！', content: null });
  }
});

// 编辑机构
server.put('/api/dept', function(req, res) {
  const dept = req.body;
  const deptList = db['systemManager_deptList'] || [];
  // 先删除原有的
  const rlt = deleteDept(deptList, dept.id);
  if (!rlt.result) {
    res.send({ code: 500, message: '编辑机构失败！找不到对应的机构！', content: null });
    return;
  }
  let result = false;
  const handleList = list => {
    for (let index = 0; index < list.length; index++) {
      const item = list[index];
      // 找到该节点的父节点
      if (item.id === dept.pid) {
        item.children.push(dept);
        item.children.sort((v1, v2) => v1.orderNum - v2.orderNum);
        result = true;
        break;
      } else if (item.children && item.children.length) {
        handleList(item.children);
      }
    }
  };
  handleList(rlt.deptList);
  db['systemManager_deptList'] = rlt.deptList;
  if (result) {
    res.send({ success: true, message: '编辑机构成功！', content: null });
  } else {
    res.send({ code: 500, message: '编辑机构失败！', content: null });
  }
});
// /api/menu/list 获取资源列表
server.get('/api/menu/list', function(req, res) {
  const route = routes[req.path];
  const menuList = route ? db[route] : null;
  if (!menuList) {
    res.send({ code: 500, message: '获取资源列表失败', content: null });
    return;
  }
  res.send({ success: true, message: 'success', content: menuList });
});
// 获取父级资源（包含“顶级资源”，不包含按钮）
server.get('/api/menu/parent', function(req, res) {
  const route = routes[req.path];
  const menuList = route ? db[route] : null;
  if (!menuList) {
    res.send({ code: 500, message: '获取资源列表失败', content: null });
    return;
  }
  const newMenuList = [];
  const handleList = (list, newList) => {
    for (let index = 0; index < list.length; index++) {
      const item = list[index];
      // 按钮级别的资源不能作为别人的父级资源
      if (item.type !== 2) {
        const { id, label, code, level, parentId, parentName, orderNum, path, url, type, name } = item;
        const newItem = { id, label, code, level, parentId, parentName, orderNum, path, url, type, name, children: [] };
        if (item.children && item.children.length) {
          handleList(item.children, newItem.children);
        }
        newList.push(newItem);
      }
    }
  };
  handleList(menuList, newMenuList);
  const result = [{
    'id': 0,
    'label': '顶级资源',
    'code': null,
    'name': '',
    'level': -1,
    'parentId': -1,
    'parentName': '',
    'orderNum': 1,
    'path': '',
    'url': '',
    'type': 0,
    'children': newMenuList
  }];
  res.send({ success: true, message: 'success', content: result });
});
// 新增资源
server.post('/api/menu', function(req, res) {
  const menu = req.body;
  const menuList = db['systemManager_menuList'] || [];
  let result = false;
  const handleList = list => {
    for (let index = 0; index < list.length; index++) {
      const item = list[index];
      // 找到父节点
      if (item.id === menu.parentId) {
        // 用nanoid生成新id
        menu.id = nanoid.nanoid();
        // 将新部门添加到父节点的children里
        item.children.push(menu);
        // 按照orderNum升序排序
        item.children.sort((v1, v2) => v1.orderNum - v2.orderNum);
        result = true;
        break;
      } else if (item.children && item.children.length) {
        handleList(item.children);
      }
    }
  };
  handleList(menuList);
  db['systemManager_menuList'] = menuList;
  if (result) {
    res.send({ success: true, message: '新增资源成功！', content: null });
  } else {
    res.send({ code: 500, message: '新增资源失败！', content: null });
  }
});
const deleteMenu = (menuList, id) => {
  let result = false;
  const handleList = list => {
    for (let index = 0; index < list.length; index++) {
      const item = list[index];
      if (String(item.id) === String(id)) {
        list.splice(index, 1);
        result = true;
        break;
      } else if (item.children && item.children.length) {
        handleList(item.children);
      }
    }
  };
  handleList(menuList);
  return {
    menuList,
    result
  };
};
// 删除资源
server.delete('/api/menu/:id', function(req, res) {
  const menuList = db['systemManager_menuList'] || [];
  const rlt = deleteMenu(menuList, req.params.id);
  db['systemManager_menuList'] = rlt.menuList;
  if (rlt.result) {
    res.send({ success: true, message: '删除资源成功！', content: null });
  } else {
    res.send({ code: 500, message: '删除资源失败！', content: null });
  }
});
// 编辑资源
server.put('/api/menu', function(req, res) {
  const menu = req.body;
  const menuList = db['systemManager_menuList'] || [];
  // 先删除原有的
  const rlt = deleteMenu(menuList, menu.id);
  if (!rlt.result) {
    res.send({ code: 500, message: '编辑资源失败！找不到对应的资源！', content: null });
    return;
  }
  let result = false;
  const handleList = list => {
    for (let index = 0; index < list.length; index++) {
      const item = list[index];
      // 找到该节点的父节点
      if (item.id === menu.parentId) {
        item.children.push(menu);
        item.children.sort((v1, v2) => v1.orderNum - v2.orderNum);
        result = true;
        break;
      } else if (item.children && item.children.length) {
        handleList(item.children);
      }
    }
  };
  handleList(rlt.menuList);
  db['systemManager_menuList'] = rlt.menuList;
  if (result) {
    res.send({ success: true, message: '编辑资源成功！', content: null });
  } else {
    res.send({ code: 500, message: '编辑资源失败！', content: null });
  }
});
// 获取角色列表
server.get('/api/role/list', function(req, res) {
  const route = routes[req.path];
  const roleList = route ? db[route] : null;
  if (!roleList) {
    res.send({ code: 500, message: '获取角色列表失败', content: null });
    return;
  }
  res.send({ success: true, message: 'success', content: roleList });
});
// 新增角色
server.post('/api/role', function(req, res) {
  const route = routes[req.path];
  const roleList = route ? db[route] : null;
  const contain = roleList.list.some(item => String(item.id) === String(req.body.id));
  if (contain) {
    res.send({ code: 500, message: '该角色已存在！', content: null });
    return;
  }
  roleList.list.push({
    id: nanoid.nanoid(),
    ...req.body
  });
  db[route] = roleList;
  res.send({ success: true, message: '角色新增成功！', content: null });
});
// 编辑角色
server.put('/api/role', function(req, res) {
  const route = routes[req.path];
  const roleList = route ? db[route] : null;
  let result = false;
  for (let index = 0; index < roleList.list.length; index++) {
    let item = roleList.list[index];
    if (String(item.id) === String(req.body.id)) {
      item = { ...item, ...req.body };
      result = true;
    }
  }
  if (!result) {
    res.send({ code: 500, message: '找不到该角色', content: null });
    return;
  }
  db[route] = roleList;
  res.send({ success: true, message: 'success', content: null });
});
// 删除角色
server.delete('/api/role/:id', function(req, res) {
  const roleList = db['systemManager_roleList'];
  if (req.params.id == null) {
    res.send({ code: 500, message: '删除角色失败！入参有问题！', content: null });
    return;
  }
  let rlt = false;
  for (let index = 0; index < roleList.list.length; index++) {
    const item = roleList.list[index];
    if (item.id === req.params.id) {
      roleList.list.splice(index, 1);
      rlt = true;
      break;
    }
  }
  if (!rlt) {
    res.send({ code: 500, message: '删除角色失败！找不到该角色！', content: null });
    return;
  }
  res.send({ success: true, message: '删除角色成功！', content: null });
});
server.get('/api/role/getAssignPermissionTree', function(req, res) {
  const menuList = db['systemManager_menuList'];
  const roleList = db['systemManager_roleList'];
  const roleId = req.query.roleId;
  const result = {
    checkList: null,
    menuList
  };
  let rlt = false;
  for (let index = 0; index < roleList.list.length; index++) {
    const item = roleList.list[index];
    console.log('item.id', item.id);
    console.log('roleId', roleId);
    if (String(item.id) === String(roleId)) {
      result.checkList = item.menuId;
      rlt = true;
      break;
    }
  }
  if (!rlt) {
    res.send({ code: 500, message: '找不到该角色！', content: null });
    return;
  }
  res.send({ success: true, message: 'success', content: result });
});
// 权限分配
server.post('/api/role/roleAssignSave', function(req, res) {
  const roleList = db['systemManager_roleList'];
  let rlt = false;
  for (let index = 0; index < roleList.list.length; index++) {
    const item = roleList.list[index];
    if (String(item.id) === String(req.body.roleId)) {
      item.menuId = req.body.list;
      rlt = true;
      break;
    }
  }
  if (!rlt) {
    res.send({ code: 500, message: '找不到该角色！', content: null });
    return;
  }
  db['systemManager_roleList'] = roleList;
  res.send({ success: true, message: '权限保存成功！', content: null });
});
server.get('/scene/list', function(req, res) {
  const route = routes[req.path];
  const sceneList = route ? db[route] : null;
  res.send({ success: true,
    message: 'success',
    content: {
      total: sceneList.length,
      list: sceneList
    }});
});
server.post('/scene/save', function(req, res) {
  const route = routes[req.path];
  const sceneList = route ? db[route] : null;
  if (req.body.id == null) {
    const scene = {
      id: nanoid.nanoid(),
      ...req.body
    };
    sceneList.push(scene);
  } else {
    for (let index = 0; index < sceneList.length; index++) {
      const item = sceneList[index];
      if (item.id === req.body.id) {
        Object.assign(item, req.body);
      }
    }
  }
  res.send({ success: true, message: 'success', content: null });
});
server.get('/scene/getSceneApiById', function(req, res) {
  const route = routes[req.path];
  const sceneApiList = route ? db[route] : null;
  const sceneId = req.body.sceneId;
  if (sceneId == null) {
    res.send({ code: 500, message: '请传递sceneId', content: null });
    return;
  }
  res.send({ success: true, message: 'success', content: sceneApiList });
});
// 服务部署到3005端口
server.listen(3005, () => {
  console.log('mock服务启动成功');
});
