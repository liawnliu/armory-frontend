
<template>
  <CommTemplate>
    <ContentTemplate
      :handle-area="{ addBtnName: '新增机器', addBtnAuth: ['system:machine:save'] }"
      :pagination.sync="pagination"
      @addItem="addMachine"
      @searItem="getMachineList({ keyword: $event })"
      @paginationChange="getMachineList"
    >
      <MachineTable :machine-list="machineList" /><!-- 显示机器列表 -->
      <MachineDialog />
    </ContentTemplate>
  </CommTemplate>
</template>

<script>
import CommTemplate from '@/views/common/CommTemplate.vue';
import ContentTemplate from '@/views/common/ContentTemplate.vue';
import { machineDialogEvent } from '@/config/event.js';
import { getMachineList } from '@/api/system-manager';
import MachineDialog from './components/MachineDialog.vue';
import MachineTable from './components/MachineTable.vue';
export default {
  name: 'MachineManager',
  components: {
    CommTemplate,
    ContentTemplate,
    MachineTable,
    MachineDialog
  },
  data() {
    return {
      // 分页信息，会通过props方式传递给ContentTemplate组件，接口每次更新也会更新这个分页信息
      pagination: { size: 10, page: 1, total: 0 },
      // 机器列表，会通过props方式传递给MachineTable组件，接口每次更新也会更新任务列表
      machineList: []
    };
  },
  provide() {
    return {
      getMachineList: this.getMachineList
    };
  },
  created() {
    this.getMachineList(); // 向服务器请求机器列表
  },
  methods: {
    // 向服务请求机器列表
    async getMachineList(params) {
      try {
        params = Object.assign({ keyword: '' }, this.pagination, params || {});
        const { content } = await getMachineList(params); // 向服务器请求工程列表
        console.log('getMachineList content', content);
        if (content == null) return;
        this.pagination.total = content.total; // 更新ContentTemplate的分页信息
        this.machineList = content.list; // 更新TaskTable需要的taskList
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    addMachine() {
      this.$bus.$emit(machineDialogEvent, { dialogType: 'add' });
    }
  }
};
</script>
