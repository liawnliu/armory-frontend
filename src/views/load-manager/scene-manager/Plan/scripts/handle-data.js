export function handleSavePlanRequest(data) {
  if (!data) return '';
  let resultObj = null;
  const { id, stressId, sceneId, note, email, planName, status, machineCount, planModel, cronExpression } = data;
  const basicMsg = { id, stressId, sceneId, note, email, planName, status, machineCount, planModel, cronExpression };
  // 普通模式
  if (!data.planModel) {
    const { durationTime, conn } = data;
    resultObj = { ...basicMsg, durationTime, conn };
  } else {
    const { startConn, stepConn, maxExecuteCount, singleExecuteTime, inflectionStop } = data;
    resultObj = { ...basicMsg, startConn, stepConn, maxExecuteCount, singleExecuteTime, inflectionStop
    };
  }
  return resultObj;
}
