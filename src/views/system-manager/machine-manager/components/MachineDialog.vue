<template>
  <el-dialog :visible.sync="dialogVisible" :title="title" :close-on-click-modal="false" @close="dialogClose">
    <el-form ref="form" :model="machine" :rules="rules" label-width="140px" label-position="right">
      <el-form-item label="机器IP" prop="ip"><el-input v-model.lazy="machine.ip" /></el-form-item>
      <el-form-item label="机房名称" prop="machineRoom"><el-input v-model.lazy="machine.machineRoom" /></el-form-item>
      <el-form-item label="机器配置" prop="configure"><el-input v-model.lazy="machine.configure" /></el-form-item>
      <el-form-item label="备注" prop="note">
        <el-input v-model="machine.note" :autosize="{ minRows: 3, maxRows: 10 }" type="textarea" />
      </el-form-item>
    </el-form>
    <div style="text-align: right">
      <el-button type="primary" @click="saveMachine">保存</el-button>
      <el-button type="danger" @click="dialogVisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { machineDialogEvent } from '@/config/event.js';
import { saveMachine } from '@/api/system-manager';
export default {
  name: 'SysUserDialog',
  data() {
    return {
      machine: {},
      dialogType: 'add',
      dialogVisible: false,
      rules: {
        ip: [{ required: true, trigger: 'blur', message: '请填写机器IP' }],
        machineRoom: [{ required: true, trigger: 'blur', message: '请填写机房名称' }],
        configure: [{ required: true, trigger: 'blur', message: '请填写机器配置' }]
      }
    };
  },
  computed: {
    title() {
      return this.dialogType === 'edit' ? '更新机器' : '新增机器';
    }
  },
  mounted() {
    this.$bus.$on(machineDialogEvent, this.showOrHide);
  },
  beforeDestroy() {
    this.$bus.$off(machineDialogEvent);
  },
  inject: ['getMachineList'],
  methods: {
    dialogClose() {
      this.machine = {};
      this.$refs.form.clearValidate(); // 关闭时清空校验信息
    },
    showOrHide({ machine, dialogType }) {
      console.log('showOrHide machine', machine);
      this.dialogVisible = true;
      dialogType != null && (this.dialogType = dialogType);
      machine != null && (this.machine = { ...machine });
    },
    saveMachine() {
      this.$refs.form.validate(async(result, msgObj) => {
        console.log('saveMachine result', result);
        console.log('saveMachine msg', msgObj);
        if (result) {
          try {
            await saveMachine(this.machine);
            this.$message({ type: 'success', message: `${this.title}成功！` });
            this.dialogVisible = false;
            this.getMachineList();
          } catch ({ message }) {
            this.$message({ type: 'error', message });
          }
        } else {
          if (msgObj && typeof msgObj === 'object') {
            for (const key in msgObj) {
              // 只提示第一条信息
              const message = msgObj[key] && msgObj[key].length && msgObj[key][0] ? msgObj[key][0].message : '';
              this.$message({ type: 'error', message: message || '校验不通过' });
              break;
            }
          }
        }
      });
    }
  }
};
</script>

<style lang='scss' scoped></style>
