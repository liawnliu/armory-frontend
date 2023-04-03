<template>
  <div>
    <el-table
      :data="deptList" row-key="id"
      style="width: 100%"
      border stripe
      default-expand-all :tree-props="{children: 'children'}"
    >
      <el-table-column prop="name" label="部门名称" width="220" />
      <el-table-column prop="parentName" label="上级部门" width="220" />
      <el-table-column align="center" prop="deptCode" label="部门编码" width="100" />
      <el-table-column align="center" prop="deptPhone" label="部门电话" width="120" />
      <el-table-column prop="deptAddress" label="部门地址" />
      <el-table-column align="center" prop="manager" label="负责人" width="80" />
      <el-table-column label="操作" width="180">
        <template slot-scope="{row}">
          <el-button
            v-btn-auth="['system:dept:save']" type="primary"
            @click="editItem(row)"
          >编辑</el-button>
          <el-button
            v-btn-auth="['system:dept:delete']" type="danger"
            @click="deleteItem(row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { deptDialogEvent } from '@/config/event.js';
import { deleteDept } from '@/api/system-manager';
export default {
  name: 'DeptTable',
  props: {
    deptList: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  inject: ['getDeptList'],
  methods: {
    // 编辑
    editItem(row) {
      this.$bus.$emit(deptDialogEvent, { dept: row, dialogType: 'edit' });
    },
    // 删除
    async deleteItem({ id }) {
      try {
        await this.$confirm('您是否确定要删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        await deleteDept({ id });
        this.$message({ type: 'success', message: '删除机构成功！' });
        this.getDeptList();
      } catch (error) {
        if (error === 'cancel') return;
        this.$message({ type: 'error', message: error.message });
      }
    }
  }
};
</script>

<style lang='scss' scoped></style>
