/**
 * 接口响应与请求数据的处理，原则是只修改数据内容，至于传进来的是个对象，
 * 那么请生成一个新对象，不要对原对象进行修改
 */
/** 处理getTaskList接口的响应 src\views\load-manager\TaskManager\index.vue */
export function handleGetTaskListResponse(data) {
  if (!data) return;
  const resultObj = {
    taskList: [],
    size: data.size,
    total: data.total,
    page: data.page
  };
  if (!data.list || !data.list.length) return resultObj;
  data.list.forEach(task => {
    task.envSortName = '';
    switch (task.envSort) {
    case 0:
      task.envSortName = '压测环境';
      break;
    case 1:
      task.envSortName = '线上环境';
      break;
    }
    // 展示到页面上的数据
    resultObj.taskList.push(task);
  });
  return resultObj;
}
export function initTaskDialogData({ id, stressName, envSort, remark }) {
  return {
    id,
    stressName: stressName != null ? stressName : '',
    envSort: envSort != null ? envSort : 0,
    remark: remark != null ? remark : ''
  };
}
