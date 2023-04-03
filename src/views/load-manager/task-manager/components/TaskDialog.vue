<template>
  <!-- 新增/编辑任务 -->
  <el-dialog :visible.sync="dialogVisible" :title="title" :close-on-click-modal="false" @close="dialogClose">
    <el-form ref="form" :rules="rules" :model="task" label-width="140px" label-position="right">
      <el-form-item label="任务名称" prop="stressName">
        <el-input v-model.lazy="task.stressName" />
      </el-form-item>
      <el-form-item label="环境类型" prop="envSort">
        <el-select v-model="task.envSort" placeholder="请选择环境类型">
          <el-option label="压测环境" :value="0" />
          <el-option label="线上环境" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model.lazy="task.remark" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" />
      </el-form-item>
    </el-form>
    <div style="text-align: right">
      <el-button type="primary" @click="saveTask">保存</el-button>
      <el-button type="danger" @click="dialogVisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { taskDialogEvent } from '@/config/event.js';
import { saveTask } from '@/api/load-manager';
import { initTaskDialogData } from '../scripts/handle-data';
export default {
  name: 'TaskDialog',
  data() {
    return {
      task: {},
      dialogType: 'add',
      dialogVisible: false,
      rules: {
        stressName: [{ required: true, trigger: 'blur', message: '请填写任务名称' }],
        envSort: [{ required: true, trigger: 'blur', message: '请选择环境类型' }]
      }
    };
  },
  computed: {
    title() {
      return this.dialogType === 'edit' ? '更新任务' : '新增任务';
    }
  },
  // 依赖注入，获取祖先TaskManager/index.vue提供的getTaskList，用来请求最新的任务列表
  // 依赖注入一般用来获取祖先提供的方法。虽然可以提供数据，但是提供的数据不是响应式的，那就只能EventBus或者Vuex
  inject: ['getTaskList'],
  mounted() {
    // 绑定一个taskDialogEvent事件到全局事件总线上，触发这个事件会隐藏or显示本dialog组件
    this.$bus.$on(taskDialogEvent, this.showOrHide);
  },
  beforeDestroy() {
    // 组件销毁前解绑taskDialogEvent事件
    this.$bus.$off(taskDialogEvent);
  },
  methods: {
    showOrHide({ task, dialogType }) {
      console.log('showOrHide task', task);
      this.dialogVisible = true;
      this.dialogType = dialogType;
      this.task = initTaskDialogData(task);
    },
    dialogClose() {
      this.task = {}; // 关闭时数据清空
      this.$refs.form.clearValidate(); // 关闭时清空校验信息
    },
    saveTask() {
      console.log('this.task', this.task);
      this.$refs.form.validate(async(result, msgObj) => {
        console.log('saveForm result', result);
        console.log('saveForm msg', msgObj);
        if (!result) {
          if (msgObj && typeof msgObj === 'object') {
            for (const key in msgObj) {
              // 只提示第一条信息
              const message = msgObj[key] && msgObj[key].length && msgObj[key][0] ? msgObj[key][0].message : '';
              this.$message({ type: 'error', message: message || '校验不通过' });
              return false;
            }
          }
        } else {
          try {
            // 调后端接口
            await saveTask(this.task);
            this.$message({ type: 'success', message: '操作成功!' });
            // 窗口隐藏
            this.dialogVisible = false;
            // 使用inject“依赖注入”的方法，通知主页面去更新TaskList
            this.getTaskList();
          } catch ({ message }) {
            this.dialogVisible = false;
            this.$message({ type: 'error', message });
          }
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped></style>
