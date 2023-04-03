import axios from 'axios';
import qs from 'qs';
import store from '@/store';
import router from '@/router';
import { checkToken } from '@/utils/auth';
import mockList from '@/config/mockList';
import notContentList from '@/config/notContentList';
import { tryShowLoading, tryHideLoading } from '@/utils/loading';
import { arrayBufferToBase64 } from '@/utils/index.js';

// 生成一个axios实例
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 10 * 1000 // 如果需要重试，可以使用axios-retry
});

// axios request拦截器
service.interceptors.request.use(
  config => {
    // 打开loading遮罩，但不是所有接口都有loading遮罩
    const needLoading = config.needLoading;
    needLoading && tryShowLoading();
    // mock接口有自己独特的baseURL
    const mockContain = mockList.some(item => config.url.indexOf(item) === 0);
    mockContain && (config.baseURL = process.env.VUE_APP_BASE_API_MOCK);
    // 检查token是否快过期了，是的话就刷新token。设置token到config.headers
    return checkToken(config);
  },
  error => {
    console.warn('request interceptors error:', error);
    // 关闭loading遮罩，但不是所有接口都有loading遮罩
    const needLoading = error.config.needLoading;
    needLoading && tryHideLoading();
    return Promise.reject(error); // 对应在外面的接口最好catch一下
  }
);
// axios response拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;
    const url = response.config.url;
    const responseType = response.config.responseType;
    // 关闭loading遮罩，但不是所有接口都有loading遮罩
    const needLoading = response.config.needLoading;
    needLoading && tryHideLoading();
    if (res.success) {
      console.log(`接口${url}的响应data：`, res);
      return res;
    } else if (notContentList.includes(url)) {
      console.log(`文件下载：接口${url}的响应data：`, res);
      // 验证码处理：返回的是arraybuffer,需要转车base64
      if (responseType === 'arraybuffer') {
        return arrayBufferToBase64(res);
      }
      return res;
    } else {
      console.warn('axios响应拦截器 response：', response);
      return Promise.reject(new Error(res.message || 'Error')); // 对应在外面的接口最好catch一下
    }
  },
  error => {
    // 关闭loading遮罩，但不是所有接口都有loading遮罩
    const needLoading = error.config.needLoading;
    needLoading && tryHideLoading();
    // token失效了就重置token，location刷新后会被permission.js里的前置路由守卫判断token，没有就会重定向到登录页
    if (error.response && error.response.status === 401) {
      store.dispatch('user/resetToken').then(() => {
        router.push(`/login?redirect=${router.currentRoute.fullPath}`);
      });
    }
    console.warn('axios响应拦截器 error：', error);
    return Promise.reject(error); // 对应在外面的接口最好catch一下
  }
);

// 请求方法
const http = {
  post(url, params, needLoading = true) {
    return service.post(url, params, {
      needLoading, // 是否需要loading遮罩
      transformRequest: [params => JSON.stringify(params)],
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  put(url, params, needLoading = true) {
    return service.put(url, params, {
      needLoading,
      transformRequest: [params => JSON.stringify(params)],
      headers: {
        'Content-Type': 'application/json'
      }
    });
  },
  // parm =>  {id:10}
  // http://localhost:8089/api/user?id=10
  get(url, params, needLoading = true) {
    return service.get(url, {
      needLoading,
      params: params,
      paramsSerializer: params => qs.stringify(params)
    });
  },
  // parm =>  {id:10}
  // http://localhost:8089/api/user/10
  getRestApi(url, params, needLoading = true) {
    let _params;
    if (Object.is(params, undefined || null)) {
      _params = '';
    } else {
      _params = '/';
      for (const key in params) {
        // 实例属性
        if (Object.prototype.hasOwnProperty.call(params, key) && params[key]) {
          _params += `${params[key]}/`;
        }
      }
      // 去掉参数最后一位（/）
      _params = _params.substr(0, _params.length - 1);
    }
    console.log('getRestApi', _params);
    if (_params) {
      return service.get(`${url}${_params}`, { needLoading });
    } else {
      return service.get(url, { needLoading });
    }
  },
  // parm =>  {id:10}
  // http://localhost:8089/api/user/10
  delete(url, params, needLoading = true) {
    let _params;
    if (Object.is(params, undefined || null)) {
      _params = '';
    } else {
      _params = '/';
      for (const key in params) {
        // 实例属性
        if (Object.prototype.hasOwnProperty.call(params, key) && params[key]) {
          _params += `${params[key]}/`;
        }
      }
      // 去掉参数最后一位?
      _params = _params.substr(0, _params.length - 1);
    }
    if (_params) {
      return service.delete(`${url}${_params}`, { needLoading });
    } else {
      return service.delete(url, { needLoading });
    }
  },
  download(url, params, needLoading = true) {
    return service.get(url, {
      params: params,
      paramsSerializer: params => qs.stringify(params),
      // 解决文件下载打不开的问题
      responseType: 'blob',
      needLoading
    });
  },
  // upload接口的Content-Type是特殊值'multipart/form-data'
  upload(url, params, needLoading = true) {
    return service.post(url, params, {
      needLoading,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  // 提交form表单，例如login接口的Content-Type是特殊值'application/x-www-form-urlencoded'
  postForm(url, params, needLoading = true) {
    return service.post(url, params, {
      needLoading,
      transformRequest: [params => {
        return qs.stringify(params);
      }],
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  },
  getImage(url, needLoading = true) {
    return service.post(url, null, {
      needLoading,
      responseType: 'arraybuffer'
    });
  }
};

export default http;
