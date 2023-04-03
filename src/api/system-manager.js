import http from '@/utils/request';

/* 获取用户列表 */
export async function getSysUserList(params) {
  return await http.post('/user/list', params);
}
// 新增用户
export async function saveSysUser(params) {
  return await http.post('/user/save', params);
}
// 删除用户
export async function deleteSysUser({ id }) {
  return await http.delete(`/user/delete/${id}`);
}
export async function getRoleListForAssign(params) {
  return await http.get('/user/getRolistForAssign', params);
}
export async function getRoleIdByUserId({ userId }) {
  return await http.get(`/user/getRoleIdByUserId/${userId}`);
}
export async function assingRole(params) {
  return await http.post('/user/assingRole', params);
}
/* '/sys/role/api/list' */
export async function getRoleList(params) {
  return await http.get('/role/list', params);
}
// 新增、编辑角色
export async function saveRole(params) {
  return await http.post('/role/save', params);
}
// 删除角色
export async function deleteRole({ id }) {
  return await http.delete(`/role/delete/${id}`);
}
// 获取分配权限树数据
export async function getAssignTree(params) {
  return await http.get('/role/getAssignPermissionTree', params);
}
// 分配权限保存
export async function roleAssignSave(params) {
  return await http.post('/role/roleAssignSave', params);
}
/* 获取资源列表 */
export async function getMenuList(params) {
  return await http.get('/permission/list', params);
}
// 获取上级资源
export async function getParMenuList() {
  return await http.get('/permission/parent');
}
// 新增or编辑资源
export async function saveMenu(params) {
  return await http.post('/permission/save', params);
}
// 删除资源
export async function deleteMenu({ id }) {
  return await http.delete(`/permission/delete/${id}`);
}
/* '/sys/machine/api/list' */
export async function getMachineList(params) {
  return await http.get('/machine/list', params);
}
/* '/sys/machine/api/delete' */
export async function deleteMachine({ id }) {
  return await http.post(`/machine/delete/${id}`);
}
/* 保持机器信息 */
export async function saveMachine(params) {
  return await http.post('/machine/save', params);
}
// 获取部门列表（不包含“顶级部门”）
export async function getDeptList(params) {
  return await http.get('/department/list', params);
}
// 获取部门列表（包含“顶级部门”）
export async function getParentDepartList(params) {
  return await http.get('/department/parent', params);
}
// 删除部门
export async function deleteDept({ id }) {
  return await http.delete(`/department/delete/${id}`);
}
// 新增、编辑部门
export async function saveDept(params) {
  return await http.post('/department/save', params);
}
