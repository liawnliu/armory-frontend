<template>
  <CommTemplate>
    <ContentTemplate
      :handle-area="{ addBtnVisible: false }"
      :pagination.sync="pagination"
      @searItem="getReportList({ keyword: $event })"
      @paginationChange="getReportList"
    >
      <ReportTable :report-list="reportList" />
    </ContentTemplate>
  </CommTemplate>
</template>

<script>
import CommTemplate from '@/views/common/CommTemplate.vue';
import ContentTemplate from '@/views/common/ContentTemplate.vue';
import ReportTable from './components/ReportTable.vue';
import { getReportList } from '@/api/load-manager';
export default {
  name: 'ReportDisplay',
  components: {
    CommTemplate,
    ContentTemplate,
    ReportTable
  },
  data() {
    return {
      // 分页信息，会通过props方式传递给ContentTemplate组件，接口每次更新也会更新这个分页信息
      pagination: { size: 10, page: 1, total: 0 },
      reportList: []
    };
  },
  created() {
    this.getReportList(); // 向服务器请求压测结果任务列表
  },
  methods: {
    async getReportList(params) {
      try {
        params = Object.assign({ keyword: '' }, this.pagination, params || {});
        const { content } = await getReportList(params); // 向服务器请求工程列表
        console.log('getReportList content', content);
        this.pagination.total = content.total; // 更新ContentTemplate的分页信息
        this.reportList = content.list; // 更新ProjectTable需要的projectList
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
