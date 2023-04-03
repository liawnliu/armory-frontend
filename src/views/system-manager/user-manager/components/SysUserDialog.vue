<template>
  <el-dialog :visible.sync="dialogVisible" :title="title" top="20px" :close-on-click-modal="false" @close="dialogClose">
    <el-form ref="form" :model="sysUser" :rules="rules" label-width="120px" label-position="right">
      <el-form-item label="登录名" prop="username">
        <el-input v-model.lazy="sysUser.username" :disabled="dialogType==='edit'" />
      </el-form-item>
      <el-form-item v-if="dialogType==='add'" label="密码" prop="password">
        <el-input v-model.lazy="sysUser.password" />
      </el-form-item>
      <el-form-item label="昵称" prop="name"><el-input v-model.lazy="sysUser.name" /></el-form-item>
      <el-form-item label="真实姓名" prop="loginName"><el-input v-model.lazy="sysUser.loginName" /></el-form-item>
      <el-form-item label="所属部门" prop="deptName">
        <el-input v-model="sysUser.deptName" @click.native="selectDept" />
      </el-form-item>
      <el-form-item label="电话" prop="mobile"><el-input v-model.lazy="sysUser.mobile" /></el-form-item>
      <el-form-item label="邮箱" prop="email"><el-input v-model.lazy="sysUser.email" /></el-form-item>
    </el-form>
    <div style="text-align: right">
      <el-button type="primary" @click="saveSysUser">保存</el-button>
      <el-button type="danger" @click="dialogVisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { sysUserDialogEvent, listTreeDialogEvent } from '@/config/event.js';
import { saveSysUser } from '@/api/system-manager';
import { toValidate } from '@/utils/validate';
export default {
  name: 'SysUserDialog',
  data() {
    return {
      sysUser: { deptName: '', deptId: null },
      roleList: [],
      deptList: [],
      dialogType: 'add',
      dialogVisible: false,
      rules: {
        username: [{ required: true, trigger: 'blur', message: '请填写登录名' }],
        password: [{ required: true, trigger: 'blur', message: '请填写密码' }],
        name: [{ required: true, trigger: 'blur', message: '请填写昵称' }],
        loginName: [{ required: true, trigger: 'blur', message: '请填写真实姓名' }],
        deptName: [{ required: true, trigger: 'blur', message: '请填写所属部门' }],
        email: [{ required: true, trigger: 'blur', message: '请填写邮箱' }]
      }
    };
  },
  computed: {
    title() {
      return this.dialogType === 'edit' ? '更新用户' : '新增用户';
    }
  },
  mounted() {
    this.$bus.$on(sysUserDialogEvent, this.showOrHide);
  },
  beforeDestroy() {
    this.$bus.$off(sysUserDialogEvent);
  },
  inject: ['getSysUserList'],
  methods: {
    dialogClose() {
      this.sysUser = { deptName: '', deptId: null };
      this.$refs.form.clearValidate(); // 关闭时清空校验信息
    },
    showOrHide({ sysUser, dialogType, deptList, currDeptMsg }) {
      console.log('showOrHide sysUser', sysUser);
      this.dialogVisible = true;
      dialogType != null && (this.dialogType = dialogType);
      this.deptList = deptList;
      sysUser != null && (this.sysUser = { ...this.sysUser, ...sysUser });
      (dialogType === 'edit') && (this.sysUser.password = null);
      currDeptMsg != null && (this.sysUser = { ...this.sysUser, ...currDeptMsg });
    },
    updateDept({ data }) {
      console.log('updateDept data', data);
      this.sysUser.deptId = data.id;
      this.sysUser.deptName = data.name;
      this.$refs.form.clearValidate('deptName');
    },
    // 给用户选择它的部门
    selectDept() {
      this.$bus.$emit(listTreeDialogEvent, {
        dialogTitle: '选择部门',
        list: this.deptList,
        label: 'name',
        updateData: this.updateDept
      });
    },
    async saveSysUser() {
      const validateRlt = await toValidate(this.$refs.form); // 校验表单
      if (!validateRlt) return false; // 校验没通过
      try {
        await saveSysUser(this.sysUser);
        this.$message({ type: 'success', message: '用户信息保存成功!' });
        this.dialogVisible = false;
        this.getSysUserList();
        // 当前登录用户信息变了
        const nowUser = this.$store.getters.user;
        if (this.sysUser.id != null && nowUser.id === this.sysUser.id) {
          // 更新当前登录用户的信息以及资源信息（可访问路由和左侧菜单列表）
          await this.$store.dispatch('user/updateUserAndResource', 'user');
        }
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
