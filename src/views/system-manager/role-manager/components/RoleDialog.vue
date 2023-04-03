<template>
  <el-dialog
    slot-scope="" :visible.sync="dialogVisible"
    :title="title"
    width="650px" top="50px"
    :close-on-click-modal="false" @close="dialogClose"
  >
    <el-form
      ref="form"
      :model="role" :rules="rules"
      label-width="100px" :inline="true"
      label-position="right"
    >
      <el-form-item prop="name" label="角色名称">
        <el-input v-model="role.name" />
      </el-form-item>
      <el-form-item label="角色备注">
        <el-input v-model="role.remark" />
      </el-form-item>
    </el-form>
    <div style="text-align: right; margin-top: 35px">
      <el-button type="primary" @click="saveRole">保存</el-button>
      <el-button type="danger" @click="dialogVisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { saveRole } from '@/api/system-manager';
import { roleDialogEvent } from '@/config/event.js';
import { toValidate } from '@/utils/validate';
export default {
  name: 'RoleDialog',
  inject: ['getRoleList'],
  data() {
    return {
      dialogType: 'add',
      dialogVisible: false,
      role: { id: null, name: '', remark: '' },
      rules: {
        name: [{ required: true, trigger: 'blur', message: '请填写角色名称' }]
      }
    };
  },
  computed: {
    title() {
      return this.dialogType === 'add' ? '新增角色' : '编辑角色';
    }
  },
  mounted() {
    this.$bus.$on(roleDialogEvent, this.showOrHide);
  },
  beforeDestroy() {
    this.$bus.$off(roleDialogEvent);
  },
  methods: {
    showOrHide({ dialogType, role }) {
      this.dialogVisible = true;
      dialogType != null && (this.dialogType = dialogType);
      role != null && (this.role = { ...this.role, ...role });
    },
    // 关闭弹框
    dialogClose() {
      this.role = { id: null, name: '', remark: '' };
      this.dialogType = 'add';
    },
    async saveRole() {
      const validateRlt = await toValidate(this.$refs.form); // 校验表单
      if (!validateRlt) return false; // 校验没通过
      try {
        await saveRole(this.role);
        this.$message({ type: 'success', message: `${this.title}成功！` });
        this.getRoleList();
        this.dialogVisible = false;
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    }
  }
};
</script>

<style lang='scss' scoped></style>
