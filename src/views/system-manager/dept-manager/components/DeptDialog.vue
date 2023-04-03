<template>
  <el-dialog :visible.sync="dialogVisible" :title="title" top="20px" :close-on-click-modal="false" @close="dialogClose">
    <el-form ref="form" :model="dept" :rules="rules" label-width="120px" label-position="right">
      <el-form-item prop="parentName" label="上级部门">
        <el-input v-model="dept.parentName" @click.native="selectDept" />
      </el-form-item>
      <el-form-item prop="name" label="部门名称"><el-input v-model="dept.name" /></el-form-item>
      <el-form-item label="部门编码"><el-input v-model="dept.deptCode" /></el-form-item>
      <el-form-item label="部门电话"><el-input v-model="dept.deptPhone" /></el-form-item>
      <el-form-item label="部门经理"><el-input v-model="dept.manager" /></el-form-item>
      <el-form-item label="部门地址"><el-input v-model="dept.deptAddress" /></el-form-item>
      <el-form-item label="部门序号"><el-input v-model="dept.orderNum" /></el-form-item>
    </el-form>
    <div style="text-align: right;margin-top: 20px">
      <el-button type="primary" @click="saveDept">保存</el-button>
      <el-button type="danger" @click="dialogVisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { deptDialogEvent, listTreeDialogEvent } from '@/config/event.js';
import { saveDept, getParentDepartList } from '@/api/system-manager';
import { toValidate } from '@/utils/validate';
export default {
  name: 'DeptDialog',
  data() {
    return {
      dept: { pid: -1, parentName: '' },
      dialogType: 'add',
      dialogVisible: false,
      rules: {
        parentName: [{ required: true, trigger: 'blur', message: '请填写上级部门' }],
        name: [{ required: true, trigger: 'blur', message: '请填写部门名称' }]
      }
    };
  },
  computed: {
    title() {
      return this.dialogType === 'edit' ? '更新机构' : '新增机构';
    }
  },
  mounted() {
    this.$bus.$on(deptDialogEvent, this.showOrHide);
  },
  beforeDestroy() {
    this.$bus.$off(deptDialogEvent);
  },
  inject: ['getDeptList'],
  methods: {
    dialogClose() {
      this.dept = { pid: -1, parentName: '' };
      this.$refs.form.clearValidate(); // 关闭时清空校验信息
    },
    showOrHide({ dept, dialogType }) {
      console.log('showOrHide dept', dept);
      this.dialogVisible = true;
      dialogType != null && (this.dialogType = dialogType);
      dept != null && (this.dept = { ...this.dept, ...dept });
    },
    async saveDept() {
      const validateRlt = await toValidate(this.$refs.form); // 校验表单
      if (!validateRlt) return false; // 校验没通过
      try {
        await saveDept(this.dept);
        this.$message({ type: 'success', message: `${this.title}成功！` });
        this.dialogVisible = false;
        this.getDeptList();
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    updateParDept({ data }) {
      console.log('updateParDept data', data);
      this.dept.pid = data.id;
      this.dept.parentName = data.name;
      this.$refs.form.clearValidate('parentName');
    },
    // 选择上级部门
    async selectDept() {
      try {
        const { content } = await getParentDepartList();
        if (!content || !content.length) {
          this.$message({ type: 'warning', message: '上级部门列表为空！' });
          return;
        }
        // 打开'选择上级部门'的弹窗
        this.$bus.$emit(listTreeDialogEvent, {
          dialogTitle: '选择上级部门',
          list: content,
          label: 'name',
          updateData: this.updateParDept,
          banId: [this.dept.id] // 自己不能作为自己的上级部门
        });
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    }
  }
};
</script>

<style lang='scss' scoped>
::v-deep{
  .el-input{
    width: 90%
  }
}
</style>
