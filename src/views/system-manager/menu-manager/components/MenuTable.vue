<template>
  <div>
    <el-table
      :data="menuList" row-key="id"
      style="width: 100%"
      border stripe
      default-expand-all :tree-props="{children: 'children'}"
    >
      <el-table-column prop="label" label="资源名称" width="240" />
      <el-table-column align="center" label="资源类型" width="80">
        <template slot-scope="{row}">
          <el-tag v-if="row.type === 0">目录</el-tag>
          <el-tag v-else-if="row.type === 1" type="success">菜单</el-tag>
          <el-tag v-else type="danger">按钮</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="path" label="路由地址" width="140" />
      <el-table-column prop="code" label="权限字段" width="170" />
      <el-table-column prop="url" label="组件路径" />
      <el-table-column label="操作" width="125">
        <template slot-scope="{row}">
          <el-button v-btn-auth="['system:menu:save']" type="primary" @click="editItem(row)">编辑</el-button>
          <el-button
            v-btn-auth="['system:menu:delete']" type="danger"
            @click="deleteItem(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { menuDialogEvent } from '@/config/event.js';
import { deleteMenu } from '@/api/system-manager';
export default {
  name: 'MenuTable',
  props: {
    menuList: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  inject: ['getMenuList'],
  methods: {
    // 编辑
    editItem(row) {
      this.$bus.$emit(menuDialogEvent, { menu: row, dialogType: 'edit' });
    },
    // 删除
    async deleteItem({ id }) {
      try {
        await this.$confirm('您是否确定要删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        await deleteMenu({ id });
        this.$message({ type: 'success', message: '删除机构成功！' });
        this.getMenuList();
        // 更新当前登录用户的资源信息（可访问路由和左侧菜单列表）
        await this.$store.dispatch('user/updateUserAndResource', 'resource');
      } catch (error) {
        if (error === 'cancel') return;
        this.$message({ type: 'error', message: error.message });
      }
    }
  }
};
</script>

<style lang='scss' scoped></style>
