import http from '@/utils/request';

/** 获取任务列表 */
export async function getTaskList(params) {
  return await http.get('/task/list', params);
}
/** 添加或更新任务  */
export async function saveTask(params) {
  return await http.post('/task/save', params);
}
/** 删除任务  */
export async function deleteTask({ id }) {
  return await http.post(`/task/delete/${id}`);
}
/** 获取压测场景列表 */
export async function getSceneList(params) {
  return await http.get('/scene/list', params);
}
/** 通过场景id获取压测场景 */
export async function getSceneById(params, needLoading) {
  return await http.get('/scene/getSceneById', params, needLoading);
}
/** 通过场景id获取场景里测试的接口（用例） */
export async function getSceneApiById(params) {
  return await http.get('/scene/getSceneApiById', params);
}
/** 添加或更新场景的基本信息 */
export async function saveScene(params) {
  return await http.post('/scene/saveScene', params);
}
/** 添加或更新场景的接口列表 */
export async function saveLinkApis(params) {
  return await http.post('/sceneProjectApi/saveLinkApisInfo', params);
}
/** 复制已有场景  */
export async function copyScene(params) {
  return await http.get('/scene/copyScene', params);
}
/** 删除已有场景  */
export async function deleteScene({ id }) {
  return await http.post(`/scene/delete/${id}`);
}
/** 获取jmeter压力机信息  */
export async function getPressMachine(params) {
  return await http.get('/machine/listNoPage', params);
}
/** 调试场景 */
export async function debugScene(params) {
  return await http.get('/scene/debug', params);
}
/** 执行 */
export async function executeScene(params) {
  return await http.post('/scene/execute', params);
}
/** 停止执行 */
export async function stopExecuteScene({ sceneId }) {
  return await http.post(`/scene/stop/${sceneId}`);
}
/** 下载错误日志  */
export async function downloadErrorLog(params) {
  return await http.download('/scene/downloadErrorLog', params);
}
/* '/load/scene/api/debug' */
export async function sceneDebug(params) {
  return await http.get('/scene/debug', params);
}
/* '/load/scene/api/getDebugData' */
export async function getDebugData(params, needLoading) {
  return await http.get('/scene/getDebugData', params, needLoading);
}
/* '/load/scene/api/jmeterLog' */
export async function getJmeterLog(params, needLoading) {
  return await http.get('/scene/jmeterLog', params, needLoading);
}
/** 获取定时任务列表 */
export async function getPlanList(params) {
  return await http.get('/plan/list', params);
}
/** 删除任务 */
export async function deletePlan(params) {
  return await http.post('/plan/delete', params);
}
/* '/load/plan/api/getById' */
export async function getPlanById({ id }) {
  return await http.get(`/plan/getPlanById/${id}`);
}
/** 添加或更新计划 */
export async function savePlan(params) {
  return await http.post('/plan/update', params);
}
/* 结果列表 */
export async function getResultList(params) {
  return await http.get('/result/list', params);
}
/* 编辑结果 */
export async function saveResult(params) {
  return await http.post('/result/update', params);
}
/* '/load/result/api/delete' */
export async function deleteResult({ id }) {
  return await http.post(`/result/delete/${id}`);
}
/* '/load/result/api/listDetail' */
export async function getResultDetailById({ id }) {
  return await http.get(`/result/getResultDetailById/${id}`);
}
/* '/load/result/api/historyData' */
export async function getRealTimeResultData({ sceneResultId }) {
  return await http.get(`/result/getRealTimeResultData/${sceneResultId}`);
}
/* '/load/result/api/final' */
export async function updateFlagToTable(params) {
  return await http.post('/result/final', params);
}
/* '/load/report/api/list' */
export async function getReportList(params) {
  return await http.get('/report/listCompleteTask', params);
}
/* '/load/report/api/listByResultId' */
export async function getReportDetailList({ id }) {
  return await http.get(`/report/listSceneDetailData?taskId=${id}`);
}
/** 导出报告  */
export async function downloadReport(params) {
  return await http.download('/report/download', params);
}
