/**
 * 接口响应与请求数据的处理，原则是只修改数据内容，至于传进来的是个对象，
 * 那么请生成一个新对象，不要对原对象进行修改
 */
/** 处理getApiList接口的响应 src\views\basic-manager\ApiManager\index.vue */
export function handleGetApiListResponse(data) {
  if (!data) return;
  const resultObj = {
    apiList: [],
    size: data.size,
    total: data.total,
    page: data.page
  };
  if (!data.list || !data.list.length) return resultObj;
  resultObj.apiList = data.list;
  console.log('handleGetApiListResponse resultObj:', resultObj);
  return resultObj;
}
/** 处理getApiById接口的响应  */
export function hadnleGetApiByIdResponse(data) {
  if (!data) return;
  const resultObj = {};
  Object.assign(resultObj, data);
  if (data.headerParams) {
    resultObj.headerParams = JSON.parse(data.headerParams);
  }
  if (data.uploadParams) {
    resultObj.uploadParams = JSON.parse(data.uploadParams);
  }
  console.log('hadnleGetApiByIdResponse resultObj:', resultObj);
  return resultObj;
}
/** 处理saveApi接口的请求  */
export function hadnleSaveApiRequest(data) {
  if (!data) return '';
  // 不要修改原对象data，万一接口请求失败，页面还在原地，它仍然可能需要这个data
  const resultObj = {};
  Object.assign(resultObj, data);
  if (data.headerParams) {
    resultObj.headerParams = JSON.stringify(data.headerParams);
  }
  if (data.uploadParams) {
    resultObj.uploadParams = JSON.stringify(data.uploadParams);
  }
  console.log('hadnleSaveApiRequest resultObj:', resultObj);
  return resultObj;
}
export function initApi(projectId) {
  return {
    projectId,
    protocolType: 1,
    methodType: 1,
    headerFlag: 0,
    assertType: 0,
    jmeterFlag: 0,
    checkScope: 0,
    beanshellPreFlag: 0,
    beanshellPostFlag: 0,
    uploadFlag: 0,
    paramFormatType: 1
  };
}
