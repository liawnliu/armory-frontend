<template>
  <CommTemplate>
    <ContentTemplate
      :handle-area="{ addBtnName: '新增工程', addBtnAuth: ['basic:project:save'], placeholder: '输入工程名称...' }"
      :pagination.sync="pagination"
      @addItem="addProject"
      @searItem="getProjectList({ keyword: $event })"
      @paginationChange="getProjectList"
    >
      <ProjectTable :project-list="projectList" /><!-- 显示工程列表 -->
      <ProjectDialog /><!-- 新增/编辑工程的弹框，初始化时它也会挂载 -->
    </ContentTemplate>
  </CommTemplate>
</template>

<script>
import CommTemplate from '@/views/common/CommTemplate.vue';
import ContentTemplate from '@/views/common/ContentTemplate.vue';
import { projectDialogEvent } from '@/config/event.js';
import { getProjectList } from '@/api/basic-manager';
import ProjectDialog from './components/ProjectDialog.vue';
import ProjectTable from './components/ProjectTable.vue';
import { handleGetProjectListResponse } from './scripts/handle-data';
export default {
  name: 'ProjectManager',
  components: {
    CommTemplate,
    ContentTemplate,
    ProjectDialog,
    ProjectTable
  },
  data() {
    return {
      // 分页信息，会通过props方式传递给ContentTemplate组件
      pagination: { size: 10, page: 1, total: 0 },
      // 工程列表，会通过props方式传递给ProjectTable组件
      projectList: []
    };
  },
  // 提供给后代getProjectList方法，并没有直接将this提供出去，因为直接提供this很危险
  provide() {
    return {
      getProjectList: this.getProjectList
    };
  },
  created() {
    this.getProjectList(); // 向服务器请求工程列表
  },
  methods: {
    // 向服务器请求工程列表，入参params可能是null可能是{}可能是{size,page,total,keyword}
    async getProjectList(params) {
      try {
        // 因为params的多样性，所以将{ keyword: '' }最底层以免没有传keyword，第二层this.pagination以免没有传分页信息
        params = Object.assign({ keyword: '' }, this.pagination, params || {});
        const { content } = await getProjectList(params); // 向服务器请求工程列表
        console.log('getProjectList content', content, this);
        const data = handleGetProjectListResponse(content); // 将后端数据处理成前端数据
        if (!data) return;
        this.pagination.total = data.total; // 更新ContentTemplate的分页信息
        this.projectList = data.projectList; // 更新ProjectTable需要的projectList
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    // 添加新工程。通知dialogProject展示，这里为什么没有用props，原因是ProjectDialog的兄弟组件ProjectTable也会调用它。
    addProject() {
      this.$bus.$emit(projectDialogEvent, { dialogType: 'add', project: {}});
    }
  }
};
</script>

<style lang="scss" scoped></style>
