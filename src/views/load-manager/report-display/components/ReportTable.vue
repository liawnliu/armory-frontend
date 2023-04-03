<template>
  <el-table :data="reportList" style="width: 100%" border stripe>
    <el-table-column align="center" label="报表ID" width="100">
      <template slot-scope="scope">
        {{ scope.row.id }}
      </template>
    </el-table-column>
    <el-table-column align="center" label="报表名称" width="400">
      <template slot-scope="scope">
        <!-- 如果name存在于resourceMap中，证明路由存在可以跳转，否则跳到404notFound页面 -->
        <router-link
          class="table-stress-name"
          :to="{name:'ReportDetail', query: {reportId:scope.row.id}}"
        >{{
          scope.row.stressName
        }}</router-link>
      </template>
    </el-table-column>
    <el-table-column align="header-center" label="创建人" prop="name" />
    <el-table-column align="header-center" label="环境">
      <template slot-scope="scope">
        {{ scope.row.envSort ? '线上环境' : '压测环境' }}
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'ReportTable',
  props: {
    reportList: { type: Array, required: false, default: () => [] }
  }
};
</script>

<style lang="scss" scoped>
.table-stress-name {
  text-decoration-line: underline;
}
</style>
