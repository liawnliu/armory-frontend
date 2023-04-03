<template>
  <el-table :data="machineList" style="width: 100%" border stripe>
    <el-table-column align="center" label="机器ID" width="100" prop="id" />
    <el-table-column align="header-center" label="机器IP" prop="ip" />
    <el-table-column align="header-center" label="机房名称" prop="machineRoom" />
    <el-table-column align="header-center" label="配置" prop="configure" />
    <el-table-column align="header-center" label="状态">
      <template slot-scope="scope">
        <el-button :type="scope.row.statusLev">{{ getStatusName(scope.row) }}</el-button>
      </template>
    </el-table-column>
    <el-table-column align="center" label="操作">
      <template slot-scope="scope">
        <el-button
          v-btn-auth="['system:machine:save']" type="primary"
          @click="editItem(scope)"
        >编辑</el-button>
        <el-button
          v-btn-auth="['system:machine:delete']" type="danger"
          @click="deleteItem(scope)"
        >删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { machineDialogEvent } from '@/config/event.js';
import { deleteMachine } from '@/api/system-manager';
export default {
  name: 'MachineTable',
  props: {
    machineList: { type: Array, required: false, default: () => [] }
  },
  inject: ['getMachineList'],
  methods: {
    editItem(scope) {
      if (!scope.row) return;
      console.log('editItem', scope.row);
      this.$bus.$emit(machineDialogEvent, {
        dialogType: 'edit',
        machine: scope.row
      });
    },
    async deleteItem(scope) {
      if (!scope.row || scope.row.id == null) return;
      console.log('deleteItem', scope.row);
      try {
        await this.$confirm('您是否确定要删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        // 调后端接口去删除task
        await deleteMachine({ id: scope.row.id });
        this.$message({ type: 'success', message: '删除成功!' });
        // 使用inject“依赖注入”的方法，通知主页面去更新machineList
        this.getMachineList();
      } catch (error) {
        if (error === 'cancel') return;
        this.$message({ type: 'error', message: error.message });
      }
    },
    getStatusName(row) {
      switch (row.status) {
      case 0:
        this.$set(row, 'statusLev', 'success');
        return '空闲';
      default:
        this.$set(row, 'statusLev', 'danger');
        return '占用';
      }
    }
  }
};
</script>

<style lang='scss' scoped></style>
