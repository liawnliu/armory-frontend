<template>
  <el-dialog title="执行场景" :visible.sync="dialogVisible" :close-on-click-modal="false" @close="clearData">
    <el-form ref="form" :model="form" label-width="170px" label-position="right" :rules="rules">
      <el-form-item label="执行模式" prop="executeType">
        <el-select v-model="form.executeType" style="display: inline-block; width: 40%; margin-right: 3%">
          <el-option label="普通模式" :value="0" />
          <el-option label="自动加压" :value="1" />
        </el-select>
        <el-form-item
          v-show="form.executeType == 1"
          prop="inflectionStop"
          style="display: inline-block; margin: 0; width: 57%"
        >
          <el-checkbox v-model="form.isInflectionStop">找到拐点后停止压测</el-checkbox>
        </el-form-item>
      </el-form-item>
      <!-- transition是过渡标签，与template一样没有对应的实体标签 -->
      <transition name="fade" mode="out-in">
        <!-- transition的限制是只能有一个直接子元素，所以这里得用v-if，也最好加上key -->
        <div v-if="form.executeType == 0" key="executeType0">
          <el-form-item label="并发数" prop="tcpConn">
            <el-input v-model="form.tcpConn" />
          </el-form-item>
          <el-form-item label="持续时间(秒)" prop="durationTime">
            <el-input v-model="form.durationTime" />
          </el-form-item>
          <el-form-item label="连接超时时间(秒)" prop="outTime">
            <el-input v-model="form.outTime" />
          </el-form-item>
        </div>
        <div v-if="form.executeType == 1" key="executeType1">
          <el-form-item label="起始并发" prop="startConn">
            <el-input v-model="form.startConn" />
          </el-form-item>
          <el-form-item label="递增步长" prop="stepConn">
            <el-input v-model="form.stepConn" />
          </el-form-item>
          <el-form-item label="最多执行轮数" prop="maxExecuteCount">
            <el-input v-model="form.maxExecuteCount" />
          </el-form-item>
          <el-form-item label="单轮持续时间(秒)" prop="singleExecuteTime">
            <el-input v-model="form.singleExecuteTime" />
          </el-form-item>
        </div>
      </transition>
      <el-form-item label="压力机" prop="pressureMachineSelect">
        <el-checkbox-group
          v-if="form.pressureMachine && form.pressureMachine.length"
          v-model="form.pressureMachineSelect"
        >
          <el-checkbox
            v-for="item in form.pressureMachine" :key="item.id"
            :label="item.ip" name="type"
            style="display:block"
          >
            {{ item.id }}-{{ item.ip }}-{{ item.machineRoom }}
          </el-checkbox>
        </el-checkbox-group>
        <span v-else :style="{'color': 'red', 'fontWeight': 'bold'}">暂无空闲的压力机...</span>
      </el-form-item>
    </el-form>
    <div style="margin-top: 20px; text-align: right">
      <el-button type="primary" @click="startExecute">开始</el-button>
      <el-button type="danger" @click="dialogVisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getPressMachine, executeScene } from '@/api/load-manager';
import { handleExecuteSceneRequest } from '../scripts/handle-data';
import { executeDialogEvent } from '@/config/event';
import { toValidate } from '@/utils/validate';
export default {
  name: 'ExecuteDialog',
  props: {
    workStatus: {
      type: Number,
      required: false,
      default: 0
    }
  },
  inject: ['getSceneList'],
  data() {
    // 校验器
    const checkAutoMode = (rule, value, callback) => {
      // executeType为0，才校验
      if (this.form.executeType === 0) {
        // 加了validator会覆盖required（但不会隐藏红色的*），所以这里得自行校验空值
        if (value === '') {
          callback(new Error(rule.message));
          return;
        }
      }
      callback(); // 正常放行
    };
    const checkCompressMode = (rule, value, callback) => {
      // executeType为0，才校验
      if (this.form.executeType === 1) {
        // 加了validator会覆盖required（但不会隐藏红色的*），所以这里得自行校验空值
        if (value === '') {
          callback(new Error(rule.message));
          return;
        }
      }
      callback(); // 正常放行
    };
    const checkMachine = (rule, value, callback) => {
      console.log('checkMachine value', value);
      if (!value || !value.length) {
        return callback(new Error(rule.message));
      }
      callback(); // 正常放行
    };
    const rules = {
      tcpConn: [{ required: true, trigger: 'blur', message: '请填写并发数', validator: checkAutoMode }],
      durationTime: [{ required: true, trigger: 'blur', message: '请填写持续时间', validator: checkAutoMode }],
      outTime: [{ required: true, trigger: 'blur', message: '请填写连接超时时间', validator: checkAutoMode }],
      startConn: [{ required: true, trigger: 'blur', message: '请填写起始并发', validator: checkCompressMode }],
      stepConn: [{ required: true, trigger: 'blur', message: '请填写递增步长', validator: checkCompressMode }],
      maxExecuteCount: [{ required: true, trigger: 'blur', message: '请填写最多执行轮数', validator: checkCompressMode }],
      singleExecuteTime: [{ required: true, trigger: 'blur', message: '请填写单轮持续时间', validator: checkCompressMode }],
      pressureMachineSelect: [{ required: true, trigger: 'blur', message: '请勾选压力机', validator: checkMachine }]
    };
    return {
      rules,
      form: { executeType: 0, pressureMachine: [], pressureMachineSelect: [] },
      dialogVisible: false,
      sceneId: null
    };
  },
  mounted() {
    this.$bus.$on(executeDialogEvent, sceneId => {
      this.sceneId = sceneId;
      this.dialogVisible = true;
      this.getPressMachine();
    });
  },
  beforeDestroy() {
    this.$bus.$off(executeDialogEvent); // 事件解绑
  },
  methods: {
    async getPressMachine() {
      try {
        const { content } = await getPressMachine({ flag: false });
        console.log('getPressMachine content', content);
        if (content == null) return;
        this.form.pressureMachine = content;
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    async startExecute() {
      console.log('this.form', this.form);
      try {
        const validateRlt = await toValidate(this.$refs.form); // 校验表单
        if (!validateRlt) return false; // 校验没通过
        this.form.workStatus = 1;
        const request = handleExecuteSceneRequest(this.form, this.sceneId);
        console.log('startExecute request', request);
        const { content } = await executeScene(request);
        console.log('startExecute content', content);
        this.$message({ type: 'success', message: '执行任务成功' });
        this.dialogVisible = false;
        this.getSceneList(); // 更新NormalScene组件的场景列表
      } catch (error) {
        if (error === 'cancel') return;
        this.$message({ type: 'error', message: error.message });
      }
    },
    clearData() {
      this.form = { executeType: 0, pressureMachine: [], pressureMachineSelect: [] };
      this.$refs.form.clearValidate(); // 关闭时清空校验信息
    }
  }
};
</script>

<style lang="scss" scoped>
.el-form {
  margin: 0;
  .el-form-item {
    width: 90%;
  }
  .machine-list {
    border: 1px solid #ccc;
    height: 200px;
    padding-inline-start: 5px;
    .machine-list-item {
      list-style: none;
      line-height: 22px;
    }
  }
  /* 过渡信息写在这两个类名里 */
  .v-enter-active,
  .v-leave-active {
    transition: opacity 0.7s linear;
  }
  /* 进入过程的开始状态就是0，并且离开过程的结束状态也是0 */
  .v-enter,
  .v-leave-to {
    opacity: 0;
  }
  /* 进入过程的结束状态就是1，并且离开过程的开始状态也是1 */
  .v-enter-to,
  .v-leave {
    opacity: 1;
  }
}
</style>
