<template>
  <!-- 新增/编辑工程 -->
  <el-dialog :visible.sync="dialogVisible" :title="title" :close-on-click-modal="false" @close="dialogClose">
    <el-form ref="form" :model="project" :rules="rules" label-width="140px" label-position="right">
      <el-form-item label="工程名称" prop="projectName">
        <el-input v-model.lazy="project.projectName" />
      </el-form-item>
      <el-form-item label="压测环境访问地址" prop="accLtestCont">
        <el-input v-model="project.accLtestCont" />
      </el-form-item>
      <el-form-item label="生产环境访问地址" prop="accOnlineCont">
        <el-input v-model="project.accOnlineCont" />
      </el-form-item>
      <el-form-item label="版本号" prop="version">
        <el-input v-model.lazy="project.version" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model.lazy="project.remark" :autosize="{ minRows: 2, maxRows: 4 }" type="textarea" />
      </el-form-item>
    </el-form>
    <div style="text-align: right">
      <el-button type="primary" @click="saveProject">保存</el-button>
      <el-button type="danger" @click="dialogVisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { projectDialogEvent } from '@/config/event.js';
import { saveProject } from '@/api/basic-manager';
import { handleSaveProjectRequest } from '../scripts/handle-data';
import { projectDialogValidate } from '../mixin/project-dialog-validate';
import { toValidate } from '@/utils/validate';
export default {
  name: 'ProjectDialog',
  mixins: [projectDialogValidate], // 将校验器的代码混入进来
  data() {
    return {
      project: {},
      dialogType: 'add',
      dialogVisible: false
    };
  },
  computed: {
    title() {
      return this.dialogType === 'edit' ? '更新工程' : '新增工程';
    }
  },
  // 依赖注入，获取祖先ProjectManager/index.vue提供的getProjectList，用来请求最新的工程列表
  // 依赖注入一般用来获取祖先提供的方法。可以注入数据，但数据就不是响应式的了
  inject: ['getProjectList'],
  mounted() {
    // 绑定一个projectDialogEvent事件到全局事件总线上，触发这个事件会隐藏or显示本dialog组件
    this.$bus.$on(projectDialogEvent, this.getData);
  },
  beforeDestroy() {
    this.$bus.$off(projectDialogEvent); // 事件解绑
  },
  methods: {
    getData({ project, dialogType }) {
      this.dialogVisible = true;
      this.dialogType = dialogType;
      this.project = { ...this.project, ...project };
    },
    dialogClose() {
      this.project = {}; // 关闭时数据清空
      this.$refs.form.clearValidate(); // 关闭时清空校验信息
    },
    async saveProject() {
      console.log('this.project', this.project);
      try {
        const validateRlt = await toValidate(this.$refs.form); // 校验表单
        if (!validateRlt) return false; // 校验没通过
        // 处理入参
        const requestParams = handleSaveProjectRequest(this.project);
        // 调后端接口
        await saveProject(requestParams);
        this.$message({ type: 'success', message: `${this.title}操作成功！` });
        // 窗口隐藏
        this.dialogVisible = false;
        // 使用inject“依赖注入”的方法，通知主页面去更新ProjectList
        this.getProjectList();
      } catch (error) {
        if (error === 'cancel') return;
        this.$message({ type: 'error', message: `${this.title}操作失败！` });
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
