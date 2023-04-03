import { Loading } from 'element-ui';

// loading单例
let instance = null;
// 需要“加载遮罩”的请求数（近段时间，比如几个接口陆续请求，它们的响应都很慢）
let needLoadingCount = 0;

// 调用element-ui的Loading来显示“加载遮罩”，会返回这个loading单例
function startLoading() {
  // lock锁定背后的滚动条
  instance = Loading.service({ lock: true, text: '加载中', background: 'rgba(0, 0, 0, 0.01)' });
}
// 用这个loading单例隐藏“加载遮罩”
function stopLoading() {
  instance && instance.close();
}
/** 对外暴露的显示“加载遮罩”的方法，多个请求共用一个loading单例 */
export function tryShowLoading() {
  // 当needLoadingCount为0时，证明此时没有“加载遮罩”了，需要重新Loading.service了
  if (needLoadingCount === 0) startLoading();
  // 每次请求加一
  needLoadingCount++;
  console.log('tryShowLoading needLoadingCount', needLoadingCount);
}
/** 对外暴露的隐藏“加载遮罩”的方法，等所有的请求完成了（得到响应或者超时）才能关闭“加载遮罩”  */
export function tryHideLoading() {
  // needLoadingCount的值大于0才能让你试图关闭“加载遮罩”，否则都没有正在请求的那怎么关闭
  if (needLoadingCount > 0) {
    needLoadingCount--;
    // 减去一次后，needLoadingCount变为0的话，那表示没有请求了，可以让“加载遮罩”隐藏了
    if (needLoadingCount === 0) {
      stopLoading();
    }
    console.log('tryHideLoading needLoadingCount', needLoadingCount);
  }
}
