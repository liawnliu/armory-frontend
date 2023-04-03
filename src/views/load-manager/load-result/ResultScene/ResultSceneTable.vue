<template>
  <el-table :data="resultSceneList" style="width: 100%" border stripe>
    <el-table-column align="center" label="场景ID" prop="id" width="150" />
    <el-table-column label="场景名">
      <template slot-scope="scope">
        <!-- 如果name存在于resourceMap中，证明路由存在可以跳转，否则跳到404notFound页面 -->
        <router-link
          class="table-scene-name" :to="{name:'LoadResult', query: {sceneId:scope.row.id,taskId}}"
        >{{
          scope.row.sceneName
        }}</router-link>
      </template>
    </el-table-column>
    <!-- <el-table-column align="center" label="状态">
      <template slot-scope="scope">
        <span :style="{'color': !!scope.row.standardStatus ? 'inherit' : 'red'}">
          {{ getStatusName(scope.row.standardStatus) }}</span>
      </template>
    </el-table-column> -->
    <el-table-column align="header-center" label="类型" prop="sceneType" width="220">
      <template slot-scope="{row}">
        {{ getSceneTypeText(row) }}
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'ResultSceneTable',
  props: {
    resultSceneList: { type: Array, required: false, default: () => [] }
  },
  computed: {
    taskId() {
      return this.$route.query.taskId;
    }
  },
  methods: {
    getSceneTypeText(data) {
      if (data.sceneType === 1) {
        return '单接口测试';
      } else if (data.sceneType === 2) {
        return '混合接口测试';
      }
    }
    /* getStatusName(standardStatus) {
      switch (standardStatus) {
      case 0:
        return '未达标';
      case 1:
        return '达标';
      default:
        return '待定';
      }
    } */
  }
};
</script>

<style lang="scss" scoped>
.table-scene-name {
  text-decoration-line: underline;
}
</style>
