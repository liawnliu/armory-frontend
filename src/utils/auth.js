import Cookies from 'js-cookie';
import store from '@/store';
import router from '@/router';
import { refreshTokenApi } from '@/api/user';

const TokenKey = 'Admin-Token';
const timeKey = 'expireTime';
const targetTime = 10;

export function getToken() {
  return Cookies.get(TokenKey);
}

export function setToken(token) {
  return Cookies.set(TokenKey, token);
}

export function removeToken() {
  return Cookies.remove(TokenKey);
}
// 清空sessionStorage数据
export function clearStorage() {
  return sessionStorage.clear();
}
// 设置token过期时间
export function setTokenTime(time) {
  return sessionStorage.setItem(timeKey, time);
}
// 清空token过期时间
export function removeTokenTime() {
  return sessionStorage.setItem(timeKey, 0);
}
// 获取token时间
export function getTokenTime() {
  return sessionStorage.getItem(timeKey);
}
// 判断当前时间距离token过期时间这个间隔是否小于target
export function checkTokenExpire(target) {
  // 获取原始的token过期时间
  const tokenTime = getTokenTime();
  // 如果这个时间是空的或者它不能转换成Number，那就刷新token（也就是返回true）
  if (!tokenTime || isNaN(tokenTime)) return true;
  // 获取Number类型的token过期时间
  const expireTime = Number(tokenTime);
  // 如果过期时间（毫秒数）小于0，那就刷新token（也就是返回true）
  if (expireTime <= 0) return true;
  // 获取当前系统时间
  const curent = new Date().getTime();
  // 此时离过期还有多久（分钟）
  const minMx = (expireTime - curent) / 1000 / 60;
  // 小于目标值就返回true刷新token，大于目标值就表明暂时不需要刷新token
  return minMx < target;
}
let refreshing = false;
export async function checkToken(config) {
  // 大于等于10分钟就不用刷新token了
  if (!checkTokenExpire(targetTime) || refreshing) {
    // 获取token，设置到config.headers
    config.headers.token = getToken();
    return config;
  }
  refreshing = true;
  // 离过期小于10分钟，那就刷新token
  try {
    // 请求新的token过期时间
    const { content } = await refreshTokenApi({ token: getToken() });
    // 设置新的token和时间
    setToken(content.token);
    setTokenTime(content.expireTime);
  } catch (error) {
    console.warn('auth error', error);
    // location刷新后会被permission.js里的前置路由守卫判断token，由于没有token了那就会重定向到登录页
    store.dispatch('user/resetToken').then(() => {
      router.push(`/login?redirect=${router.currentRoute.fullPath}`);
    });
  } finally {
    // eslint-disable-next-line require-atomic-updates
    refreshing = false;
  }
  // 给config.headers设置新token
  config.headers.token = getToken();
  return config;
}
