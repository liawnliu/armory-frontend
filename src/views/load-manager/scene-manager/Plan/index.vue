<template>
  <ContentTemplate
    :handle-area="{ addBtnVisible: false, addBtnAuth: ['load:scene:savePlan'],placeholder: '输入计划名称...' }"
    :pagination.sync="pagination"
    @searItem="getPlanList({ keyword: $event })"
    @paginationChange="getPlanList"
  >
    <PlanTable :plan-list="planList" />
    <PlanDialog />
  </ContentTemplate>
</template>

<script>
import ContentTemplate from '@/views/common/ContentTemplate.vue';
import PlanTable from './components/PlanTable.vue';
import PlanDialog from './components/PlanDialog.vue';
import { getPlanList } from '@/api/load-manager';
export default {
  name: 'PlanScene',
  components: {
    ContentTemplate,
    PlanTable,
    PlanDialog
  },
  props: { taskId: { type: [Number, String], required: true }},
  provide() {
    return {
      getPlanList: this.getPlanList
    };
  },
  data() {
    return {
      // 分页信息，会通过props方式传递给ContentTemplate组件，接口每次更新也会更新这个分页信息
      pagination: { size: 10, page: 1, total: 0 },
      planList: []
    };
  },
  created() {
    this.getPlanList(); // 向服务器请求计划列表
  },
  methods: {
    async getPlanList(params) {
      try {
        params = Object.assign({ keyword: '', stressId: this.taskId }, this.pagination, params || {});
        const { content } = await getPlanList(params); // 向服务器请求场景列表
        console.log('getPlanList content', content);
        this.pagination.total = content.total; // 更新ContentTemplate的分页信息
        this.planList = content.list; // 更新ApiTable需要的apiList
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
