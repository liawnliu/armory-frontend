<template>
  <el-table :data="taskList" style="width: 100%" border stripe>
    <!-- align对齐方式，label列名 -->
    <el-table-column align="center" label="任务ID" prop="id" width="80" />
    <el-table-column align="header-center" label="任务名称" width="150">
      <template slot-scope="scope">
        <!-- 如果name存在于resourceMap中，证明路由存在可以跳转，否则跳到404notFound页面 -->
        <router-link
          class="table-task-name"
          :to="{name:'SceneManager', query: {taskId:scope.row.id}}"
        >{{
          scope.row.stressName
        }}</router-link>
      </template>
    </el-table-column>
    <el-table-column align="header-center" prop="envSortName" label="环境" />
    <el-table-column align="header-center" prop="sceneNum" label="场景个数" />
    <el-table-column align="header-center" prop="name" label="创建人" />
    <el-table-column align="header-center" prop="createTime" label="创建时间" />
    <el-table-column align="center" label="操作">
      <template slot-scope="scope">
        <el-button v-btn-auth="['load:task:save']" type="primary" @click="editItem(scope)">编辑</el-button>
        <el-button v-btn-auth="['load:task:delete']" type="danger" @click="deleteItem(scope)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { taskDialogEvent } from '@/config/event.js';
import { deleteTask } from '@/api/load-manager';
export default {
  name: 'TaskTable',
  props: {
    taskList: { type: Array, required: false, default: () => [] }
  },
  data() {
    return { };
  },
  // 依赖注入，获取祖先TaskManager/index.vue提供的getTaskList，用来请求最新的任务列表
  // 依赖注入一般用来获取祖先提供的方法。虽然可以提供数据，但是提供的数据不是响应式的，那就只能EventBus或者Vuex
  inject: ['getTaskList'],
  methods: {
    editItem(scope) {
      if (!scope.row) return;
      console.log('editItem', scope.row);
      this.$bus.$emit(taskDialogEvent, {
        dialogType: 'edit',
        task: scope.row
      });
    },
    async deleteItem(scope) {
      if (!scope.row || scope.row.id == null) return;
      console.log('deleteItem', scope.row);
      try {
        await this.$confirm('您是否确定要删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        // 调后端接口去删除task
        await deleteTask({ id: scope.row.id });
        this.$message({ type: 'success', message: '删除成功!' });
        // 使用inject“依赖注入”的方法，通知主页面去更新taskList
        this.getTaskList();
      } catch (error) {
        if (error === 'cancel') return;
        this.$message({ type: 'error', message: error.message });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.table-task-name {
  text-decoration-line: underline;
}
</style>
