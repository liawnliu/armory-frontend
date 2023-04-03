<template>
  <el-table :data="roleList" style="width: 100%" border stripe>
    <el-table-column align="header-center" label="角色名称" prop="name" width="200" />
    <el-table-column align="header-center" label="角色备注" prop="remark" />
    <el-table-column align="header-center" label="操作" width="250">
      <template slot-scope="scope">
        <el-button v-btn-auth="['system:role:save']" type="primary" @click="editItem(scope)">编辑</el-button>
        <el-button
          v-btn-auth="['system:role:assign']" type="primary"
          @click="assignPermissions(scope)"
        >分配权限</el-button>
        <el-button
          v-btn-auth="['system:role:delete']" type="danger"
          @click="deleteItem(scope)"
        >删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { roleDialogEvent, assignPermissionDialogEvent } from '@/config/event.js';
import { deleteRole } from '@/api/system-manager';
export default {
  name: 'RoleTable',
  props: {
    roleList: { type: Array, required: false, default: () => [] }
  },
  inject: ['getRoleList'],
  methods: {
    editItem(scope) {
      if (!scope.row) return;
      console.log('handleEdit', scope.row);
      this.$bus.$emit(roleDialogEvent, {
        dialogType: 'edit',
        role: scope.row
      });
    },
    assignPermissions(scope) {
      if (!scope.row || scope.row.id == null) return;
      console.log('handleAssign', scope.row);
      // 分配权限
      this.$bus.$emit(assignPermissionDialogEvent, {
        role: scope.row
      });
    },
    // 删除
    async deleteItem(scope) {
      if (!scope.row || scope.row.id == null) return;
      console.log('handleDelete', scope.row);
      const roleId = scope.row.id;
      try {
        await this.$confirm('您是否确定要删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        // 调后端接口去删除task
        await deleteRole({ id: roleId });
        this.$message({ type: 'success', message: '删除成功!' });
        // 使用inject“依赖注入”的方法
        this.getRoleList();
        // 当前登录用户拥有的该角色
        const nowUser = this.$store.getters.user;
        if (nowUser.roleIds.includes(roleId)) {
          // 更新当前登录用户的信息以及资源信息（可访问路由和左侧菜单列表）
          await this.$store.dispatch('user/updateUserAndResource');
        }
      } catch (error) {
        if (error === 'cancel') return;
        this.$message({ type: 'error', message: error.message });
      }
    }
  }
};
</script>

<style lang='scss' scoped></style>
