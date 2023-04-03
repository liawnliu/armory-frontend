<template>
  <el-table :data="resultTaskList" style="width: 100%" border stripe>
    <el-table-column align="center" label="任务ID" width="220" prop="id" />
    <el-table-column align="center" label="任务名称" width="400">
      <template slot-scope="scope">
        <!-- 如果name存在于resourceMap中，证明路由存在可以跳转，否则跳到404notFound页面 -->
        <router-link
          class="table-stress-name" :to="{ name:'ResultScene', query: {taskId:scope.row.id}}"
        >{{
          scope.row.stressName
        }}</router-link>
      </template>
    </el-table-column>
    <el-table-column align="header-center" label="测试环境">
      <template slot-scope="scope">
        {{ scope.row.envSort ? '线上环境' : '压测环境' }}
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'ResultTaskTable',
  props: {
    resultTaskList: { type: Array, required: false, default: () => [] }
  }
};
</script>

<style lang="scss" scoped>
.table-stress-name {
  text-decoration-line: underline;
}
</style>
