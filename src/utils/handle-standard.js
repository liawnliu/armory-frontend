export function handleStandard(list) {
  if (!list || !list.length) return [];
  list.forEach(item => {
    if (item.targetTps == null || item.targetRt == null || item.targetTps === '' || item.targetRt === '') {
      item.isStandardColor = 'red';
      item.isStandardText = '无预期值';
    } else if ((Number(item.tps) >= Number(item.targetTps)) && (Number(item.rpsTime) <= Number(item.targetRt))) {
      item.isStandardColor = '#00FF00';
      item.isStandardText = '达标';
    } else {
      item.isStandardColor = 'red';
      item.isStandardText = '不达标';
    }
  });
  return list;
}
