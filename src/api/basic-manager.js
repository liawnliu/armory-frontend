import http from '@/utils/request';

/** 获取工程列表 */
export async function getProjectList(params) {
  return await http.post('/project/list', params);
}
/** 添加新工程或者更新已有工程 */
export async function saveProject(params) {
  return await http.post('/project/save', params);
}
/** 删除已有工程 */
export async function deleteProject({ id }) {
  return await http.post(`/project/delete/${id}`);
}
/** 获取工程的参数配置 */
export async function getProjectParams({ id }) {
  return await http.get(`/project/parameter/${id}`);
}
/* 配置工程参数，上传文件 */
export async function uploadParamFile(data, projectId) {
  return await http.upload(`/apiFile/upload?projectId=${projectId}`, data);
}
/** 更新工程的参数配置 */
export async function saveGlobalVars(params) {
  return await http.post('/project/saveGlobalVars', params);
}

/** 获取文件列表 */
export async function getFileList(params) {
  return await http.get('/apiFile/list', params);
}
/** 预览文件 */
export async function previewFile(params) {
  return await http.post('/apiFile/preview', params);
}
/** 下载文件 */
export async function downloadFile(params) {
  return await http.download('/apiFile/download', params);
}
/** 删除已有文件 */
export async function deleteFile(params) {
  return await http.post('/apiFile/delete', params);
}
/** 获取接口列表 '/basic/interface/api/list' */
export async function getApiList(params) {
  return await http.get('/projectApi/list', params);
}
/** 删除已有接口 '/basic/interface/api/delete' */
export async function deleteApi({ id }) {
  return await http.post(`/projectApi/delete/${id}`);
}
/** 复制已有接口 '/basic/interface/api/copy' */
export async function copyApi(params) {
  return await http.get('/projectApi/copy', params);
}
/** 通过工程ID来获取接口的具体信息 '/basic/interface/api/getById' */
export async function getApiById({ id }) {
  return await http.get(`/projectApi/getApiById/${id}`);
}
/** 更新接口的具体信息 */
export async function saveApi(params) {
  return await http.post('/projectApi/save', params);
}
