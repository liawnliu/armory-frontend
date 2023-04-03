<template>
  <el-table :data="projectList" style="width: 100%" border stripe>
    <!-- align对齐方式，label列名 -->
    <el-table-column align="center" label="工程ID" width="220" prop="id" />
    <el-table-column align="center" label="工程名称" width="220">
      <template slot-scope="{row}">
        <!-- 为什么使用name，考虑到path相比于name可能变动更频繁。但用name有个问题是，VueRouter不会对name路由不存在的 -->
        <!-- 场景进行处理，不用担心，我们在permission.js里做了处理，存在就继续跳转，不存在就跳到404notFound页面 -->
        <router-link class="table-project-name" :to="{ name:'ApiManager', query: {projectId:row.id}}">
          {{ row.projectName }}
        </router-link>
      </template>
    </el-table-column>
    <el-table-column align="header-center" label="创建人" prop="userName" />
    <el-table-column align="center" label="操作">
      <template slot-scope="{row}">
        <el-button v-btn-auth="['basic:project:save']" type="primary" @click="editItem(row)">
          编辑</el-button>
        <el-button v-btn-auth="['basic:project:delete']" type="danger" @click="deleteItem(row)">
          删除</el-button>
        <el-button v-btn-auth="['basic:project:toParam']" type="warning" @click="configItem(row)">
          配置变量</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { projectDialogEvent } from '@/config/event.js';
import { deleteProject } from '@/api/basic-manager';
export default {
  name: 'ProjectTable',
  props: {
    projectList: { type: Array, required: false, default: () => [] }
  },
  // 依赖注入，获取祖先ProjectManager/index.vue提供的getProjectList，用来请求最新的工程列表
  // 依赖注入一般用来获取祖先提供的方法。虽然可以提供数据，但是提供的数据不是响应式的
  inject: ['getProjectList'],
  methods: {
    editItem(row) {
      if (!row) return;
      console.log('editItem', row);
      // 全局事件总线向工程弹框发射事件，请求打开弹框进行编辑
      this.$bus.$emit(projectDialogEvent, { dialogType: 'edit', project: row });
    },
    async deleteItem(row) {
      if (!row || row.id == null) return;
      console.log('deleteItem', row);
      try {
        await this.$confirm('您是否确定要删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        // 调后端接口去删除project
        await deleteProject({ id: row.id });
        this.$message({ type: 'success', message: '删除成功!' });
        // 使用inject“依赖注入”的方法，通知父组件去更新ProjectList
        this.getProjectList();
      } catch (error) {
        if (error === 'cancel') return;
        this.$message({ type: 'error', message: error.message });
      }
    },
    configItem(row) {
      if (!row || row.id == null || row.createUserId == null) return;
      console.log('configItem', row);
      // 切换路由，跳到参数配置页面
      this.$router.push({ name: 'ParamConfig', query: { projectId: row.id, createUserId: row.createUserId }});
    }
  }
};
</script>

<style lang="scss" scoped>
.table-project-name {
  text-decoration-line: underline;
}
</style>
