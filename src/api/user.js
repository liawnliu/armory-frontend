import http from '@/utils/request';

// 验证码图片 '/api/sysUser/image'
export async function getImageApi(params) {
  return await http.getImage('/sysUser/image', params);
}
// '/sys/user/api/login' '/api/user/login' '/user/login'
export async function login(params) {
  return await http.postForm('/user/login', params);
}
// 刷新token
export async function refreshTokenApi(parm) {
  return await http.post('/sysUser/refreshToken', parm);
}
/* '/api/sysUser/getInfo' */
export async function getInfo(params) {
  return await http.get('/sysUser/getInfo', params);
}
// '/sys/menu/api/listBySession'
export async function getMenuList() {
  return await http.get('/sysUser/getMenuList');
}
// '/sys/user/page/logout'
export async function logout() {
  return await http.post('/sysUser/loginOut');
}
