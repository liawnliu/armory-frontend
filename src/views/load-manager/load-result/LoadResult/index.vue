<template>
  <CommTemplate>
    <ContentTemplate
      :handle-area="{ addBtnVisible: false }"
      :pagination.sync="pagination"
      @searItem="getResultList({ keyword: $event })"
      @paginationChange="getResultList"
    >
      <LoadResultTable :result-list="resultList" />
    </ContentTemplate>
  </CommTemplate>
</template>

<script>
import CommTemplate from '@/views/common/CommTemplate.vue';
import ContentTemplate from '@/views/common/ContentTemplate.vue';
import LoadResultTable from './LoadResultTable.vue';
import { getResultList } from '@/api/load-manager';
export default {
  name: 'LoadResult',
  components: {
    CommTemplate,
    ContentTemplate,
    LoadResultTable
  },
  data() {
    return {
      // 分页信息，会通过props方式传递给ContentTemplate组件，接口每次更新也会更新这个分页信息
      pagination: { size: 10, page: 1, total: 0 },
      resultList: []
    };
  },
  computed: {
    sceneId() {
      return this.$route.query.sceneId;
    },
    taskId() {
      return this.$route.query.taskId;
    }
  },
  provide() {
    return {
      getResultList: this.getResultList
    };
  },
  created() {
    this.getResultList(); // 向服务器请求压测结果任务列表
  },
  methods: {
    async getResultList(params) {
      try {
        params = Object.assign({ keyword: '', stressId: this.taskId, sceneId: this.sceneId },
          this.pagination, params || {});
        const { content } = await getResultList(params);
        console.log('getResultList content', content);
        this.pagination.total = content.total; // 更新ContentTemplate的分页信息
        this.resultList = content.list;
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
