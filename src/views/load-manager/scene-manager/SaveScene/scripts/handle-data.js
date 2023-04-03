/**
 * 处理getSceneById接口响应，将它作为el-tree数据源的root
 * showType：为0表示顶级目录，为1表示是一个接口（一级单接口或者链路内部的单接口），为2表示链路假数据。
 * @param {*} apiList 旧的el-tree数据源
 * @param {*} sceneBasic 场景基本信息，将作为新的el-tree数据源root
*/
export function handleSceneBasic(apiList, sceneBasic) {
  console.log('handleSceneBasic', apiList, sceneBasic);
  // 获取this.apiList[0]的children，这个children是在这里不做修改
  const children = apiList.length ? apiList.splice(0, 1)[0].children : [];
  // tree里的root的id不要与它子级api的id相同了，这里加上“scene-”进行区分，label为name+remark的组合
  const root = {
    ...sceneBasic,
    id: handleSceneId(sceneBasic.id, 0),
    showType: 0, // 表示顶级目录
    label: sceneBasic.sceneName, // el-tree展示需要
    children // 将旧的children拿过来用
  };
  // 先删后加是因为触发SceneApiTree的“渲染监听”，用来保持树的选中状态和展开状态
  apiList.push(root); // [root]
}

/**
 * 将getSceneApiById的响应处理成el-tree所需的数据（二级树）
 * showType：为0表示顶级目录，为1表示是一个接口（一级单接口或者链路内部的单接口），为2表示链路假数据。
 * groupFlag：为null表示该接口是一级单接口，不为null表示该接口是某个链路内的单接口
 * @param {*} apiList el-tree数据源
 * @param {*} sceneApi 该场景下所有的接口
*/
export function handleSceneApi(apiList, sceneApi) {
  console.log('handleSceneApi', apiList, sceneApi); // [root], [...]
  if (sceneApi == null) return 0;
  // 保存不同groupFlag的接口
  const apiMap = new Map();
  // 处理接口以及链路（根据groupFlag对接口进行分组）
  for (let i = 0; i < sceneApi.length; i++) {
    const item = sceneApi[i];
    // 单接口（无论是一级的还是链路内部的）
    const newItem = { ...item, label: item.apiName + (item.remark ? `—${item.remark}` : ''), showType: 1 };
    // newItem.groupFlag为null表示它是一级的单接口，不是链路内的单接口，我们将它放到“key为空字符value为数组”里
    // 不为null，那就放到“key为groupFlag，value为数组”里
    const groupFlag = newItem.groupFlag || ''; // newItem.groupFlag ? newItem.groupFlag : ''
    const tempArr = apiMap.has(groupFlag) ? apiMap.get(groupFlag) : [];
    // 将相同groupFlag的单接口放到同一个数组里
    tempArr.push(newItem);
    apiMap.set(groupFlag, tempArr); // key是groupFlag，value是一个数组，[api1, api2, api3...]
  }

  const apiArr = [];
  let maxLink = 0;
  apiMap.forEach((val, key) => {
    // key就是groupFlag，val是存储单接口的
    if (!key) { // 一级单接口   !'' ——> true
      apiArr.push(...val); // val ——> [api1, api2, api3...]
    } else { // 链路
      // 对每条链路里面的接口进行排序（升序）
      val.sort((v1, v2) => v1.orderFlag - v2.orderFlag);
      // 为每一条链路生成一个假数据放到apiArr里（主要用于前端展示），假数据的children用于放链路里所有单接口
      apiArr.push({
        id: `link-${key}`, // el-tree需要每一项都有一个id，主要用于更新渲染和拖拽
        label: `接口链路${key}`,
        groupFlag: val[0].groupFlag, // 就是其中一个单接口的groupFlag
        orderFlag: val[0].orderFlag, // 取val中orderFlag最小的，前面已经排序了，那么第一个就是最小的
        showType: 2, // showType为2表示是链路假数据，拖拽、删除整个链路时会用到它
        children: val // 链路内部的所有单接口都放到该假数据的children，形成一个二级（2层）树
      });
      if (Number(key) > maxLink) {
        maxLink = Number(key);
      }
    }
  });
  // 对apiArr整体进行排序（主要是让链路假数据在apiArr里有顺序）
  apiArr.sort((v1, v2) => v1.orderFlag - v2.orderFlag);
  // 将apiArr放到root的children，形成树形结构供el-tree使用
  if (apiList.length) {
    // 复制一个root
    // [root]，从第0项开始操作，删掉1项，得到结果是一个新数组[root]，取数组的第1项就是root
    const root = apiList.splice(0, 1)[0];
    root.children = apiArr;
    // 先删后加是因为触发SceneApiTree的“渲染监听”，用来保持树的选中状态和展开状态
    // 如果直接apiList[0].children = apiArr是触发不了“渲染监听”的，进而导致选中状态和展开状态无法还原
    apiList.push(root);
  }
  // apiList.root.children = apiArr;
  return maxLink;
}
export function handleSceneId(id, type) {
  if (type === 0) {
    return `scene-${id}`;
  } else if (type === 1) {
    return id.replaceAll('scene-', '');
  }
}
/**
 * 向场景里添加单接口/链路，将api数据处理成tree所需的数据
 * showType：为0表示顶级目录，为1表示是一个接口（一级单接口或者链路内部的单接口），为2表示链路假数据。
 * groupFlag：为null表示该接口是一级单接口，不为null表示该接口是某个链路内的单接口
 * @param {*} apiArr 新添加的一些单接口
 * @param {*} parent 向谁的children里添加单接口
 * @param {*} isLink 是否将这些单接口保存为一个链路
 * @param {*} maxLink 目前场景里最大的groupFlag
 */
export function addApiToTree(apiArr, parent, isLink, maxLink) {
  if (apiArr == null || !apiArr.length) return;
  if (parent.showType === 0) {
    if (isLink) {
      const groupFlag = String(maxLink + 1);
      // 给链路生成一个对应的假数据
      const link = {
        id: `link-${groupFlag}`,
        label: `接口链路${groupFlag}`,
        groupFlag: groupFlag,
        showType: 2,
        children: []
      };
      // 将假数据放入parent
      parent.children.push(link);
      // 处理apiArr，生成label、showType、groupFlag，然后放到link.children，形成2级树结构
      apiArr.forEach((item, index) => {
        link.children.push({
          ...item,
          label: item.apiName, // 用于在tree里展示
          showType: 1,
          groupFlag: link.groupFlag // 链路里每个单接口需要groupFlag
        });
      });
    } else {
      // 往一级里添加一些单接口
      apiArr.forEach((item, index) => {
        parent.children.push({ ...item, label: item.apiName, showType: 1 });
      });
    }
  } else if (parent.showType === 2) {
    // 往某个链路里添加一些单接口
    apiArr.forEach((item, index) => {
      parent.children.push({
        ...item,
        label: item.apiName, // 用于在tree里展示
        showType: 1,
        groupFlag: parent.groupFlag // 链路里每个单接口需要groupFlag
      });
    });
  }
}
/**
 * 更新其orderFlag
 * showType：为0表示顶级目录，为1表示是一个接口（一级单接口或者链路内部的单接口），为2表示链路假数据。
 * groupFlag：为null表示该接口是一级单接口，不为null表示该接口是某个链路内的单接口
 * @param {*} apiList el-tree展示数据来源
 */
export function updateOrderFlag(apiList) {
  let orderFlag = 1;
  const handleList = list => {
    list.forEach(item => {
      // 单接口才拥有orderFlag自增。至于链路假数据，它是取它链路内部orderFlag最小的
      if (item.showType === 1) { // 单接口
        item.orderFlag = orderFlag++;
      } else if (item.showType === 2) { // 链路假数据
        // 链路是至少有一条单接口的（如果全删完了，那链路假数据也会跟着删除，那就不用担心这里children为空了）
        handleList(item.children, { ...item, children: null });
        item.orderFlag = item.children[0].orderFlag; // 取第一个
      }
    });
  };
  handleList(apiList[0].children);
}
/**
 * tree拖拽完成后，我们需要更新groupFlag和orderFlag
 * showType：为0表示顶级目录，为1表示是一个接口（一级单接口或者链路内部的单接口），为2表示链路假数据。
 * groupFlag：为null表示该接口是一级单接口，不为null表示该接口是某个链路内的单接口
 * @param {*} apiList el-tree展示数据来源
 */
export function handleDropFinish(apiList) {
  const handleList = (list, parent) => {
    list.forEach((item, index) => {
      if (parent.showType === 0) { // 拖拽后处于一级
        if (item.showType === 1) item.groupFlag = null; // 纯粹的单接口
      } else if (parent.showType === 2) { // 拖拽后处于某个链路内
        item.groupFlag = parent.groupFlag;
      }
      if (item.children && item.children.length) {
        handleList(item.children, { ...item, children: null });
      }
    });
  };
  // 更新groupFlag
  handleList(apiList[0].children, apiList[0]); // apiList ——> [root]
  // 更新整体的orderFlag
  updateOrderFlag(apiList);
}
export function initSceneApi() {
  return {
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
export function handleSaveLinkApisReq(apiList, sceneId, stressId, apiForm) {
  const sceneProjectApiList = [];
  const handleList = list => {
    list.forEach(item => {
      // 单接口
      if (item.showType === 1) {
        sceneProjectApiList.push(item);
      }
      if (item.children && item.children.length) {
        handleList(item.children);
      }
    });
  };
  handleList(apiList[0].children);
  if (apiForm) {
    for (let index = 0; index < sceneProjectApiList.length; index++) {
      const item = sceneProjectApiList[index];
      if (item.id === apiForm.id) {
        apiForm.headerParams = JSON.stringify(apiForm.headerParams);
        apiForm.uploadParams = JSON.stringify(apiForm.uploadParams);
        Object.assign(item, apiForm);
      }
    }
  }
  return { sceneId, stressId, sceneProjectApiList };
}
