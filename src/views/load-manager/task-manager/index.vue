<template>
  <CommTemplate>
    <ContentTemplate
      :handle-area="{ addBtnName: '新增任务', addBtnAuth: ['load:task:save'], placeholder: '输入任务名称...' }"
      :pagination.sync="pagination"
      @addItem="addTask"
      @searItem="getTaskList({ keyword: $event })"
      @paginationChange="getTaskList"
    >
      <TaskTable :task-list="taskList" /><!-- 显示任务列表 -->
      <TaskDialog />
    </ContentTemplate>
  </CommTemplate>
</template>

<script>
import CommTemplate from '@/views/common/CommTemplate.vue';
import ContentTemplate from '@/views/common/ContentTemplate.vue';
import { taskDialogEvent } from '@/config/event.js';
import { getTaskList } from '@/api/load-manager';
import TaskDialog from './components/TaskDialog.vue';
import TaskTable from './components/TaskTable.vue';
import { handleGetTaskListResponse } from './scripts/handle-data';
export default {
  name: 'TaskManager',
  components: {
    CommTemplate,
    ContentTemplate,
    TaskTable,
    TaskDialog
  },
  data() {
    return {
      // 分页信息，会通过props方式传递给ContentTemplate组件，接口每次更新也会更新这个分页信息
      pagination: { size: 10, page: 1, total: 0 },
      // 任务列表，会通过props方式传递给TaskTable组件，接口每次更新也会更新任务列表
      taskList: []
    };
  },
  // 提供给后代getProjectList方法，可以用来触发向服务器请求最新的工程列表。并没有直接将this提供出去，这样很危险
  provide() {
    return {
      getTaskList: this.getTaskList
    };
  },
  created() {
    this.getTaskList(); // 向服务器请求任务列表
  },
  methods: {
    // 向服务请求任务列表
    async getTaskList(params) {
      try {
        params = Object.assign({ keyword: '' }, this.pagination, params || {});
        const { content } = await getTaskList(params); // 向服务器请求工程列表
        console.log('getTaskList content', content);
        const data = handleGetTaskListResponse(content); // 将后端数据处理成前端数据
        if (!data) return;
        this.pagination.total = data.total; // 更新ContentTemplate的分页信息
        this.taskList = data.taskList; // 更新TaskTable需要的taskList
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    // 添加新任务
    addTask() {
      this.$bus.$emit(taskDialogEvent, { dialogType: 'add', task: {}});
    }
  }
};
</script>

<style lang="scss" scoped></style>
