<template>
  <el-table :data="newMixList" style="width: 100%" border stripe :span-method="rowspanFun">
    <el-table-column align="center" label="场景名" prop="sceneName" />
    <el-table-column align="center" label="接口">
      <template slot-scope="scope">
        {{ scope.row.apiName }}
      </template>
    </el-table-column>
    <el-table-column align="header-center" label="并发数" prop="cons" width="65" />
    <el-table-column align="header-center" label="总并发数" prop="totalCons" width="80" />
    <el-table-column align="header-center" label="目标tps" prop="targetTps" width="70" />
    <el-table-column align="header-center" label="实际tps" prop="tps" width="70" />
    <el-table-column align="header-center" label="目标rt" prop="targetRt" width="65" />
    <el-table-column align="header-center" label="响应时间(ms)" prop="rpsTime" width="80" />
    <el-table-column align="header-center" label="tp90(ms)" prop="tp90" width="55" />
    <el-table-column align="header-center" label="成功率(%)" prop="successRate" width="65" />
    <el-table-column align="header-center" label="总请求数" prop="totalRequest" width="80" />
    <el-table-column align="header-center" label="服务器负载" prop="serverLoad" width="65" />
    <el-table-column align="header-center" label="压测时间" prop="createTime" width="100" />
    <el-table-column align="header-center" label="是否达标" width="80">
      <template slot-scope="{row}">
        <span :style="{'color': row.isStandardColor}">{{ row.isStandardText }}</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'MixIntTable',
  props: { mixList: { type: Array, default: () => [] }},
  computed: {
    newMixList() {
      // 对mixList进行处理，因为它的顺序可能是乱的，我们必须让sceneResultId相同的放在同一个容器里（spanArr数组里）
      const map = new Map();
      for (let index = 0; index < this.mixList.length; index++) {
        const item = this.mixList[index];
        if (map.has(item.sceneResultId)) {
          const spanArr = map.get(item.sceneResultId); // 得到spanArr数组
          spanArr.push(item); // 向spanArr数组里添加新的项，因为sceneResultId相同
        } else {
          console.log('item', item);
          // 第一次进入，sceneResultId相同表示同一个混合场景，初始化一个spanArr数组保存合并项
          map.set(item.sceneResultId, [item]);
          console.log('mapmap', map);
        }
      }
      if (!map.size) return [];
      console.log('map', map);
      let countIndex = 0;
      const newMixList = [];
      const iterator = map.entries();
      console.log('iterator', iterator);
      let entry = iterator.next(); // entry有两个属性，value属性是map容器中的每一项，done属性表示是否结束遍历
      while (!entry.done) {
        console.log('entry', entry);
        const spanArr = entry.value[1]; // entry.value是个数组，索引0位置上是key，索引1位置上是key对应的value
        console.log('spanArr', spanArr);
        spanArr.forEach((mixItem, i) => {
          if (i === 0) {
            // 合并是从第一项开始的，那我们把从哪里合并，合并几行，这两个信息放在第一项里
            newMixList.push({ ...mixItem, rowSpan: { firstIndex: countIndex, spanNum: spanArr.length }});
          } else {
            newMixList.push(mixItem); // 正常情况
          }
          countIndex++;
        });
        entry = iterator.next(); // 更新entry
      }
      console.log('newMixList', newMixList);
      return newMixList;
    }
  },
  methods: {
    // 单元格合并
    rowspanFun({ row, column, rowIndex, columnIndex }) {
      const rowSpan = this.newMixList[rowIndex].rowSpan;
      console.log('rowIndex', rowIndex);
      if (columnIndex === 0 || columnIndex === 3 || columnIndex === 11) {
        if (rowSpan != null && rowSpan.firstIndex === rowIndex) {
          console.log('rowSpan.spanNum', rowSpan.spanNum);
          return {
            rowspan: rowSpan.spanNum,
            colspan: 1
          };
        }
        return {
          rowspan: 0,
          colspan: 0
        };
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
