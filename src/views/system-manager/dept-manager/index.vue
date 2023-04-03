
<template>
  <CommTemplate>
    <ContentTemplate
      :handle-area="{ addBtnName: '新增机构', addBtnAuth: ['system:dept:save'], placeholder: '输入某个顶级部门的名称...' }"
      @addItem="addDept"
      @searItem="getDeptList({ keyword: $event })"
    >
      <DeptTable :dept-list="deptList" />
      <DeptDialog />
      <ListTreeDialog />
    </ContentTemplate>
  </CommTemplate>
</template>

<script>
import CommTemplate from '@/views/common/CommTemplate.vue';
import ContentTemplate from '@/views/common/ContentTemplate.vue';
import DeptTable from './components/DeptTable.vue';
import DeptDialog from './components/DeptDialog.vue';
import ListTreeDialog from '@/views/common/ListTreeDialog.vue';
import { deptDialogEvent } from '@/config/event.js';
import { getDeptList } from '@/api/system-manager';
export default {
  name: 'DeptManager',
  components: {
    CommTemplate,
    ContentTemplate,
    DeptTable,
    DeptDialog,
    ListTreeDialog
  },
  data() {
    return {
      // 部门列表，会通过props方式传递给DeptTable组件，接口每次更新也会更新任务列表
      deptList: []
    };
  },
  provide() {
    return {
      getDeptList: this.getDeptList
    };
  },
  created() {
    this.getDeptList(); // 向服务器请求部门列表
  },
  methods: {
    // 向服务请求部门列表
    async getDeptList(params) {
      try {
        const { content } = await getDeptList(params || { keyword: '' }); // 向服务器请求部门列表
        console.log('getDeptList content', content);
        if (content == null) return;
        this.deptList = content; // 更新DeptTable需要的deptList
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    addDept() {
      this.$bus.$emit(deptDialogEvent, { dialogType: 'add' });
    }
  }
};
</script>
