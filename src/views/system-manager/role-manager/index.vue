
<template>
  <CommTemplate>
    <ContentTemplate
      :handle-area="{ addBtnName: '新增角色', addBtnAuth: ['system:role:save'] }"
      :pagination.sync="pagination"
      @addItem="addRole"
      @searItem="getRoleList({ keyword: $event })"
      @paginationChange="getRoleList"
    >
      <RoleTable :role-list="roleList" />
      <RoleDialog />
      <AssignPermissionDialog />
    </ContentTemplate>
  </CommTemplate>
</template>

<script>
import CommTemplate from '@/views/common/CommTemplate.vue';
import ContentTemplate from '@/views/common/ContentTemplate.vue';
import { roleDialogEvent } from '@/config/event.js';
import { getRoleList } from '@/api/system-manager';
import RoleTable from './components/RoleTable.vue';
import RoleDialog from './components/RoleDialog.vue';
import AssignPermissionDialog from './components/AssignPermissionDialog.vue';
export default {
  name: 'RoleManager',
  components: {
    CommTemplate,
    ContentTemplate,
    RoleTable,
    RoleDialog,
    AssignPermissionDialog
  },
  data() {
    return {
      pagination: { size: 10, page: 1, total: 0 },
      roleList: []
    };
  },
  provide() {
    return {
      getRoleList: this.getRoleList
    };
  },
  created() {
    this.getRoleList();
  },
  methods: {
    async getRoleList(params) {
      try {
        params = Object.assign({ keyword: '' }, this.pagination, params || {});
        const { content } = await getRoleList(params); // 向服务器请求RoleList
        console.log('getRoleList content', content);
        if (content == null) return;
        this.pagination.total = content.total; // 更新ContentTemplate的分页信息
        this.roleList = content.list; // 更新RoleTable需要的taskList
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    addRole() {
      this.$bus.$emit(roleDialogEvent, { dialogType: 'add' });
    }
  }
};
</script>
