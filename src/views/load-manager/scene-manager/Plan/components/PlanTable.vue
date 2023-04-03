<template>
  <el-table :data="planList" style="width: 100%" border stripe>
    <el-table-column align="center" label="计划ID" prop="id" width="160" />
    <el-table-column align="center" label="计划名称" prop="planName" width="160" />
    <el-table-column align="header-center" prop="sceneName" label="对应场景" />
    <el-table-column align="header-center" label="状态">
      <template slot-scope="{row}">
        {{ row.status ? '启用' : '停用' }}
      </template>
    </el-table-column>
    <el-table-column align="header-center" prop="name" label="创建人" />
    <el-table-column align="center" label="操作">
      <template slot-scope="{row}">
        <el-button v-btn-auth="['load:scene:savePlan']" type="primary" @click="editItem(row)">编辑</el-button>
        <el-button
          v-btn-auth="['load:scene:deletePlan']"
          type="danger"
          @click="deleteItem(row)"
        >删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { deletePlan } from '@/api/load-manager';
import { planDialogEvent } from '@/config/event';
export default {
  name: 'PlanTable',
  props: {
    planList: {
      type: Array,
      required: true,
      default: () => []
    }
  },
  inject: ['getPlanList'],
  methods: {
    editItem({ id, sceneId, stressId }) {
      if (id == null || sceneId == null || stressId == null) return;
      this.$bus.$emit(planDialogEvent, { dialogType: 'add', plan: { planId: id, sceneId, stressId }});
    },
    async deleteItem(row) {
      if (!row || row.id == null) return;
      console.log('deleteItem', row);
      try {
        await this.$confirm('您是否确定要删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        // 调后端接口去删除PlanScene
        await deletePlan({ id: row.id, planName: row.planName });
        this.$message({ type: 'success', message: '删除成功!' });
        this.getPlanList(); // 更新父组件的场景列表
      } catch (error) {
        if (error === 'cancel') return;
        this.$message({ type: 'error', message: error.message });
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
