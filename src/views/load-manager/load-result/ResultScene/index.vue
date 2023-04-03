<template>
  <CommTemplate>
    <ContentTemplate
      :handle-area="{ addBtnVisible: false }"
      :pagination.sync="pagination"
      @searItem="getSceneList({ keyword: $event })"
      @paginationChange="getSceneList"
    >
      <ResultSceneTable :result-scene-list="resultSceneList" />
    </ContentTemplate>
  </CommTemplate>
</template>

<script>
import CommTemplate from '@/views/common/CommTemplate.vue';
import ContentTemplate from '@/views/common/ContentTemplate.vue';
import ResultSceneTable from './ResultSceneTable.vue';
import { getSceneList } from '@/api/load-manager';
export default {
  name: 'ResultScene',
  components: {
    CommTemplate,
    ContentTemplate,
    ResultSceneTable
  },
  data() {
    return {
      // 分页信息，会通过props方式传递给ContentTemplate组件，接口每次更新也会更新这个分页信息
      pagination: { size: 10, page: 1, total: 0 },
      resultSceneList: []
    };
  },
  computed: {
    taskId() {
      return this.$route.query.taskId;
    }
  },
  created() {
    this.getSceneList(); // 向服务器请求压测结果任务列表
  },
  methods: {
    async getSceneList(params) {
      try {
        params = Object.assign({ keyword: '', stressId: this.taskId }, this.pagination, params || {});
        const { content } = await getSceneList(params); // 向服务器请求工程列表
        console.log('getSceneList content', content);
        this.pagination.total = content.total; // 更新ContentTemplate的分页信息
        this.resultSceneList = content.list;
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
