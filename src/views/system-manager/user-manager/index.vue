
<template>
  <CommTemplate>
    <el-container>
      <!-- 部门树 -->
      <el-aside width="20%">
        <ListTree :list="deptList" label="name" :curr-key="currDeptMsg.deptId" :click-fun="clickDept" />
      </el-aside>
      <!-- 部门下的用户 -->
      <el-main>
        <ContentTemplate
          :handle-area="{ addBtnName: '新增用户', addBtnAuth: ['system:user:save'], placeholder: '输入当前部门里某个用户名...' }"
          :pagination.sync="pagination"
          @addItem="addSysUser"
          @searItem="getSysUserList({ keyword: $event })"
          @paginationChange="getSysUserList"
        >
          <SysUserTable :sys-user-list="sysUserList" :dept-list="deptList" /><!-- 显示用户列表 -->
          <SysUserDialog />
          <ListTreeDialog />
          <AssignRoleDialog />
        </ContentTemplate>
      </el-main>
    </el-container></CommTemplate>
</template>

<script>
import CommTemplate from '@/views/common/CommTemplate.vue';
import ContentTemplate from '@/views/common/ContentTemplate.vue';
import { sysUserDialogEvent } from '@/config/event.js';
import { getDeptList, getSysUserList } from '@/api/system-manager';
import SysUserDialog from './components/SysUserDialog.vue';
import SysUserTable from './components/SysUserTable.vue';
import ListTree from '@/views/common/components/ListTree.vue';
import ListTreeDialog from '@/views/common/ListTreeDialog.vue';
import AssignRoleDialog from './components/AssignRoleDialog.vue';
export default {
  name: 'UserManager',
  components: {
    CommTemplate,
    ContentTemplate,
    SysUserTable,
    ListTree,
    SysUserDialog,
    ListTreeDialog,
    AssignRoleDialog
  },
  data() {
    return {
      // 分页信息，会通过props方式传递给ContentTemplate组件，接口每次更新也会更新这个分页信息
      pagination: { size: 10, page: 1, total: 0 },
      // 部门列表
      deptList: [],
      // 用户列表，会通过props方式传递给TaskTable组件，接口每次更新也会更新任务列表
      sysUserList: [],
      // 目前左侧选中的部门信息
      currDeptMsg: { deptId: 1, deptName: '' }
    };
  },
  provide() {
    return {
      getSysUserList: this.getSysUserList
    };
  },
  created() {
    this.initData();
  },
  methods: {
    async initData() {
      await this.getDeptList(); // 向服务器请求部门列表
      await this.getSysUserList(); // 向服务器请求用户列表
    },
    // 向服务请求部门列表
    async getDeptList() {
      try {
        const { content } = await getDeptList({ keyword: '' }); // 向服务器请求部门列表
        console.log('getDeptList content', content);
        if (content == null) return;
        this.deptList = content; // 更新DeptTable需要的deptList
        if (this.deptList.length) {
          this.currDeptMsg.deptId = this.deptList[0].id;
          this.currDeptMsg.deptName = this.deptList[0].name;
        }
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    // 向服务请求用户列表
    async getSysUserList(params) {
      try {
        params = Object.assign({ keyword: '', deptId: this.currDeptMsg.deptId }, this.pagination, params);
        console.log('getSysUserList params', params);
        const { content } = await getSysUserList(params); // 向服务器请求工程列表
        console.log('getSysUserList content', content);
        if (content == null) return;
        this.pagination.total = content.total; // 更新ContentTemplate的分页信息
        this.sysUserList = content.list;
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    clickDept({ data }) {
      const { id, name } = data;
      this.currDeptMsg = { deptId: id, deptName: name };
      this.getSysUserList();
    },
    addSysUser() {
      this.$bus.$emit(sysUserDialogEvent, {
        dialogType: 'add',
        deptList: this.deptList,
        currDeptMsg: this.currDeptMsg
      });
    }
  }
};
</script>
<style lang="scss" scoped>
::v-deep {
  .el-aside{
    padding: 10px 0px 0px 0px;
    background: #fff;
    border-right: 1px solid #dfe6ec;
  }
  .el-main{
    padding: 0 0 0 15px;
  }
}
</style>
