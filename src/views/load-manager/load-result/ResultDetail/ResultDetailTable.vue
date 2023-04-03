<template>
  <el-table :data="resultDetail" style="width: 100%" border stripe>
    <el-table-column align="center" label="接口名" prop="apiName" />
    <el-table-column align="center" label="发送请求数" prop="totalRequest" width="100" />
    <el-table-column align="header-center" label="目标tps" prop="targetTps" width="70" />
    <el-table-column align="header-center" label="实际tps" prop="tps" width="70" />
    <el-table-column align="header-center" label="目标rt" prop="targetRt" width="65" />
    <el-table-column align="header-center" label="响应时间(ms)" prop="rpsTime" width="80" />
    <el-table-column align="header-center" label="tp90(ms)" prop="tp90" width="55" />
    <el-table-column align="header-center" label="执行时间(s)" prop="stressTime" width="80" />
    <el-table-column align="header-center" label="并发数" prop="cons" width="70" />
    <el-table-column align="header-center" label="开发人员" prop="devUsers" />
    <el-table-column align="header-center" label="成功率(%)" prop="successRate" width="65" />
    <el-table-column align="header-center" label="是否达标" width="80">
      <template slot-scope="{row}">
        <span :style="{'color': row.isStandardColor}">{{ row.isStandardText }}</span>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'ResultDetailTable',
  props: {
    resultDetail: {
      type: Array,
      required: true,
      default: []
    }
  },
  methods: {
  }
};
</script>

<style lang='scss' scoped></style>
