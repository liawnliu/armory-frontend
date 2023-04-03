<template>
  <el-table :data="singleList" style="width: 100%" border stripe>
    <el-table-column align="center" label="场景名" prop="sceneName" />
    <el-table-column align="center" label="接口" prop="apiName" />
    <el-table-column align="header-center" label="并发数" prop="cons" />
    <el-table-column align="header-center" label="总并发数" prop="totalCons" />
    <el-table-column align="header-center" label="目标tps" prop="targetTps" width="70" />
    <el-table-column align="header-center" label="实际tps" prop="tps" width="70" />
    <el-table-column align="header-center" label="目标rt" prop="targetRt" width="65" />
    <el-table-column align="header-center" label="响应时间(ms)" prop="rpsTime" width="80" />
    <el-table-column align="header-center" label="tp90(ms)" prop="tp90" width="55" />
    <el-table-column align="header-center" label="成功率(%)" prop="successRate" width="65" />
    <el-table-column align="header-center" label="总请求数" prop="totalRequest" />
    <el-table-column align="header-center" label="服务器负载" prop="serverLoad" width="65" />
    <el-table-column align="header-center" label="压测时间" prop="createTime" />
    <el-table-column align="header-center" label="是否达标" width="80">
      <template slot-scope="{row}">
        <span :style="{'color': row.isStandardColor}">{{ row.isStandardText }}</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'SingleIntTable',
  props: { singleList: { type: Array, required: true, default: () => [] }}
};
</script>

<style lang="scss" scoped></style>
