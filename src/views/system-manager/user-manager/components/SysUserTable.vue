<template>
  <el-table :data="sysUserList" style="width: 100%" border stripe>
    <el-table-column align="center" label="用户名" prop="loginName" width="140" />
    <el-table-column label="所属部门" prop="deptName" />
    <el-table-column align="header-center" label="电话" prop="mobile" width="120" />
    <el-table-column align="header-center" label="邮箱" prop="email" width="180" />
    <el-table-column align="center" label="操作" width="210">
      <template slot-scope="scope">
        <el-button
          v-btn-auth="['system:user:save']" type="primary"
          @click="editItem(scope)"
        >编辑</el-button>
        <el-button
          v-btn-auth="['system:user:delete']" type="danger"
          @click="deleteItem(scope)"
        >删除</el-button>
        <el-button
          v-btn-auth="['system:user:assign']" type="primary"
          @click="assignRole(scope)"
        >分配角色</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { sysUserDialogEvent, assignRoleDialogEvent } from '@/config/event.js';
import { deleteSysUser } from '@/api/system-manager';
export default {
  name: 'SysUserTable',
  props: {
    sysUserList: { type: Array, required: false, default: () => [] },
    deptList: { type: Array, required: false, default: () => [] }
  },
  inject: ['getSysUserList'],
  methods: {
    editItem(scope) {
      if (!scope.row) return;
      console.log('editItem', scope.row);
      this.$bus.$emit(sysUserDialogEvent, {
        dialogType: 'edit',
        sysUser: scope.row,
        deptList: this.deptList
      });
    },
    async deleteItem(scope) {
      if (!scope.row || scope.row.id == null) return;
      console.log('deleteItem', scope.row);
      try {
        const userId = scope.row.id;
        const message = this.$store.getters.user.id === userId
          ? '您是否确定要删除当前登录的这个用户?删除后将会退出登录!' : '您是否确定要删除?';
        await this.$confirm(message, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        // 调后端接口去删除
        await deleteSysUser({ id: userId });
        this.$message({ type: 'success', message: '删除成功!' });
        // 使用inject“依赖注入”的方法，通知主页面去更新sysUserList
        this.getSysUserList();
        // 当前登录用户没有了
        const nowUser = this.$store.getters.user;
        if (nowUser.id === userId) {
          // 退出登录
          await this.$store.dispatch('user/logout');
        }
      } catch (error) {
        if (error === 'cancel') return;
        this.$message({ type: 'error', message: error.message });
      }
    },
    async assignRole(scope) {
      if (!scope.row) return;
      console.log('editItem', scope.row);
      this.$bus.$emit(assignRoleDialogEvent, { userId: scope.row.id });
    }
  }
};
</script>

<style lang='scss' scoped></style>
