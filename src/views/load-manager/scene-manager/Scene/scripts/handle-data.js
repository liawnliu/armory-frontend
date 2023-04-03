export function handleExecuteSceneRequest(form, sceneId) {
  if (!form || !sceneId) return;
  const {
    executeType, tcpConn, durationTime, outTime,
    startConn, stepConn, maxExecuteCount, singleExecuteTime, isInflectionStop
  } = form;
  const resultObj = {
    executeType,
    tcpConn,
    durationTime,
    outTime,
    startConn,
    stepConn,
    maxExecuteCount,
    singleExecuteTime,
    isInflectionStop
  };
  resultObj.sceneId = sceneId;
  resultObj.workStatus = 1;
  // 暂时不能用数组，会报错，先写死吧
  resultObj.pressureMachine = form.pressureMachineSelect;
  return resultObj;
}
