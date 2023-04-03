<template>
  <el-dialog
    :visible.sync="dialogVisible" :title="title"
    :close-on-click-modal="false" top="10px"
    append-to-body @close="dialogClose"
  >
    <!-- :model绑定表单数据this.form，:rules绑定校验规则this.formRules -->
    <el-form ref="form" :model="plan" :rules="rules" label-width="140px" label-position="right">
      <!-- 如果在el-form上加了:rules但不生效，那就是el-form-item没加prop的原因。prop的值要是form里的属性名（字符串） -->
      <el-form-item label="计划名称" prop="planName">
        <el-input v-model="plan.planName" />
      </el-form-item>
      <el-form-item label="计划状态" prop="status">
        <el-radio-group v-model="plan.status">
          <el-radio border :label="1">启用</el-radio>
          <el-radio border :label="0">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Crontab配置" prop="cronExpression">
        <el-input v-model="plan.cronExpression" />
      </el-form-item>
      <el-form-item label="计划模式">
        <el-select v-model="plan.planModel" style="display: inline-block; width: 40%; margin-right: 3%">
          <el-option label="普通模式" :value="0" />
          <el-option label="自动模式" :value="1" />
        </el-select>
        <el-form-item
          v-show="plan.planModel == 1"
          prop="inflectionStop"
          style="display: inline-block; margin: 0; width: 57%"
        >
          <el-checkbox v-model="plan.inflectionStop">找到拐点后停止场景</el-checkbox>
        </el-form-item>
      </el-form-item>
      <el-form-item label="期望压力机数量" prop="machineCount">
        <el-input v-model="plan.machineCount" />
      </el-form-item>
      <!-- transition是过渡标签，与template一样没有对应的实体标签 -->
      <transition name="fade" mode="out-in">
        <!-- transition的限制是只能有一个直接子元素，所以这里得用v-if，也最好加上key -->
        <div v-if="plan.planModel == 0" key="executeType0">
          <el-form-item label="并发数" prop="conn">
            <el-input v-model="plan.conn" />
          </el-form-item>
          <el-form-item label="持续时间(秒)" prop="durationTime">
            <el-input v-model="plan.durationTime" />
          </el-form-item>
        </div>
        <div v-if="plan.planModel == 1" key="executeType1">
          <el-form-item label="起始并发" prop="startConn">
            <el-input v-model="plan.startConn" />
          </el-form-item>
          <el-form-item label="递增步长" prop="stepConn">
            <el-input v-model="plan.stepConn" />
          </el-form-item>
          <el-form-item label="最多执行轮数" prop="maxExecuteCount">
            <el-input v-model="plan.maxExecuteCount" />
          </el-form-item>
          <el-form-item label="单轮持续时间(秒)" prop="singleExecuteTime">
            <el-input v-model="plan.singleExecuteTime" />
          </el-form-item>
        </div>
      </transition>
      <el-form-item label="发送邮箱" prop="email">
        <el-input v-model="plan.email" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model.lazy="plan.note" :autosize="{ minRows: 5, maxRows: 5 }" type="textarea" />
      </el-form-item>
    </el-form>
    <div style="text-align: right">
      <el-button type="primary" @click="savePlan">保存</el-button>
      <el-button type="danger" @click="dialogVisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { planDialogEvent } from '@/config/event.js';
import { getPlanById, savePlan } from '@/api/load-manager';
import { toValidate } from '@/utils/validate';
import { handleSavePlanRequest } from '../scripts/handle-data.js';
export default {
  name: 'PlanDialog',
  data() {
    return {
      rules: {
        planName: [{ required: true, trigger: 'blur', message: '请填写计划名称' }],
        status: [{ required: true, trigger: 'blur', message: '请选择计划状态' }]
      },
      plan: { status: 0, planModel: 0 },
      dialogType: 'add',
      dialogVisible: false
    };
  },
  computed: {
    title() {
      return this.dialogType === 'edit' ? '更新计划' : '新增计划';
    }
  },
  inject: ['getPlanList'],
  mounted() {
    this.$bus.$on(planDialogEvent, this.getData);
  },
  beforeDestroy() {
    this.$bus.$off(planDialogEvent); // 事件解绑
  },
  methods: {
    getData({ plan, dialogType }) {
      console.log('PlanDialog getData plan', plan);
      this.dialogVisible = true;
      this.dialogType = dialogType;
      this.plan = { ...this.plan, ...plan };
      this.getPlanById();
    },
    dialogClose() {
      this.plan = { status: 0, planModel: 0 }; // 关闭时数据清空
      this.$refs.form.clearValidate(); // 关闭时清空校验信息
    },
    async getPlanById() {
      try {
        if (this.plan.planId == null) return;
        const { content } = await getPlanById({ id: this.plan.planId });
        this.plan = { ...this.plan, ...content };
        console.log('getPlanById', this.plan);
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    async savePlan() {
      console.log('this.plan', this.plan);
      try {
        const validateRlt = await toValidate(this.$refs.form); // 校验表单
        if (!validateRlt) return false; // 校验没通过
        // 调后端接口
        await savePlan(handleSavePlanRequest(this.plan));
        this.$message({ type: 'success', message: `${this.title}操作成功！` });
        // 窗口隐藏
        this.dialogVisible = false;
        // 使用inject“依赖注入”的方法，通知主页面去更新PlanList
        this.getPlanList();
      } catch (error) {
        if (error === 'cancel') return;
        this.$message({ type: 'error', message: `${this.title}操作失败！` });
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
