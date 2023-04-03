/**
 * 接口响应与请求数据的处理，原则是只修改数据内容，至于传进来的是个对象，
 * 那么请生成一个新对象，不要对原对象进行修改
 */
/** 处理getProjectList接口的响应 src\views\basic-manager\ProjectManager\index.vue */
export function handleGetProjectListResponse(data) {
  if (!data) return;
  const resultObj = {
    projectList: [],
    size: data.size,
    total: data.total,
    page: data.page
  };
  if (!data.list || !data.list.length) return resultObj;
  data.list.forEach(project => {
    let accLtestCont, accOnlineCont;
    const { accessParams } = project;
    if (accessParams) {
      const arr = JSON.parse(accessParams); // JSON字符串转换为数组
      if (arr.length) {
        // 压测环境访问地址
        accLtestCont = arr[0] ? arr[0].accessContent : '';
        // 生产环境访问地址
        accOnlineCont = arr[1] ? arr[1].accessContent : '';
      }
    }
    project.accessParams = null;
    project.accLtestCont = accLtestCont;
    project.accOnlineCont = accOnlineCont;
    // 展示到页面上的数据
    resultObj.projectList.push(project);
  });
  return resultObj;
}

export function handleSaveProjectRequest(project) {
  if (!project) return '';
  const resultObj = {};
  Object.assign(resultObj, project);
  resultObj.accessParams = [];
  if (project.accLtestCont) {
    resultObj.accessParams.push({
      accessEnv: 0,
      accessContent: project.accLtestCont
    });
  }
  if (project.accOnlineCont) {
    resultObj.accessParams.push({
      accessEnv: 1,
      accessContent: project.accOnlineCont
    });
  }
  resultObj.accessParams = JSON.stringify(resultObj.accessParams);
  return resultObj;
}
export function hadnleSaveFormRequest(data, projectId) {
  const resultObj = data.slice();
  const jsonStr = JSON.stringify(resultObj);
  return {
    id: Number(projectId),
    projectVars: jsonStr
  };
  // return `id=${projectId}&projectVars=${jsonStr}`;
}
export function initProjectDialogData({ id, projectName, accLtestCont, accOnlineCont, version, remark }) {
  return {
    id: id != null ? id : 0,
    projectName: projectName != null ? projectName : '',
    accLtestCont: accLtestCont != null ? accLtestCont : '',
    accOnlineCont: accOnlineCont != null ? accOnlineCont : '',
    version: version != null ? version : '',
    remark: remark != null ? remark : ''
  };
}
export function handleGetFileList(list) {
  list.forEach(item => {
    item.select = false;
  });
  return list;
}
