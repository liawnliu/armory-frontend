<template>
  <CommTemplate>
    <el-button class="add-btn" type="primary" round @click="addParam">添加变量</el-button>
    <ConfigTable :params-list="paramsList" :project-id="projectId" :create-user-id="createUserId" />
    <SelectFileDialog />
    <ShowFileContentDialog />
  </CommTemplate>
</template>

<script>
import CommTemplate from '@/views/common/CommTemplate.vue';
import ConfigTable from './components/ConfigTable.vue';
import SelectFileDialog from './components/SelectFileDialog.vue';
import ShowFileContentDialog from './components/ShowFileDialog.vue';
import { getProjectParams } from '@/api/basic-manager';
import { Message } from 'element-ui';
import { addConfigTableItemEvent } from '@/config/event.js';
export default {
  name: 'ParamConfig',
  components: { CommTemplate, ConfigTable, SelectFileDialog, ShowFileContentDialog },
  data() {
    return { paramsList: [] };
  },
  computed: {
    projectId() {
      return this.$route.query.projectId || ''; // 它不会被手动修改，那么用计算属性会比较好
    },
    createUserId() {
      return this.$route.query.createUserId || ''; // 它不会被手动修改，那么用计算属性会比较好
    }
  },
  created() {
    this.getProjectParams({ id: this.projectId }); // 向服务请求参数列表
  },
  methods: {
    // 向服务请求参数列表
    async getProjectParams(params) {
      try {
        const { content } = await getProjectParams(params);
        console.log('getProjectParams content', content);
        if (content == null) return;
        this.paramsList = content;
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    addParam() {
      this.$bus.$emit(addConfigTableItemEvent);
    }
  },
  // 通过路由规则进入组件时被调用，此时组件实例还未生成
  beforeRouteEnter(to, from, next) {
    if (!to.query.projectId) {
      // 组件实例还未生成，所以不能使用this.$message，那么就用Message
      Message.error('进入“参数配置页面”需要传递projectId！已帮你重定向到“工程管理页面”');
      next({ name: 'ProjectManager' }); // 重定向到工程管理
    }
    next();
  },
  // 路由地址改变，包括浏览器地址后面的参数被去掉再回车，就会触发这个钩子
  beforeRouteUpdate(to, from, next) {
    // 只验证本组件的
    if (to.name === 'ParamConfig' && to.query.projectId == null) {
      Message.error('进入“参数配置页面”需要传递projectId！已帮你重定向到“工程管理页面”');
      next({ name: 'ProjectManager' }); // 重定向到工程管理
    }
    next();
  }
};
</script>

<style lang="scss" scoped>
.add-btn {
  margin: 15px 0;
}
</style>
