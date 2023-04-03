<template>
  <CommTemplate>
    <el-tabs v-model="activeName" type="card" @tab-click="tabClick">
      <el-tab-pane label="压测场景" name="scene"><Scene :task-id="taskId" /></el-tab-pane>
      <el-tab-pane label="定时计划" name="plan"><Plan :task-id="taskId" /></el-tab-pane>
    </el-tabs>
  </CommTemplate>
</template>

<script>
import { Message } from 'element-ui';
import CommTemplate from '@/views/common/CommTemplate.vue';
import Scene from './Scene/index.vue';
import Plan from './Plan/index.vue';
export default {
  name: 'SceneManager',
  components: {
    CommTemplate,
    Scene,
    Plan
  },
  data() {
    return {
      activeName: this.$route.query.activeName ? this.$route.query.activeName : 'scene'
    };
  },
  computed: {
    taskId() {
      return this.$route.query.taskId;
    }
  },
  methods: {
    tabClick() {
      this.$route.query.activeName = this.activeName;
    }
  },
  // 通过路由规则进入组件时被调用，此时组件实例还未生成
  beforeRouteEnter(to, from, next) {
    if (to.query.taskId == null) {
      // 组件实例还未生成，所以不能使用this.$message，那么就用Message
      Message.error('进入“场景管理页面”需要传递taskId！已帮你重定向到“任务管理页面”');
      next({ name: 'TaskManager' }); // 重定向到任务管理
    }
    next();
  },
  // 路由地址改变，包括浏览器地址后面的参数被去掉再回车，就会触发这个钩子
  beforeRouteUpdate(to, from, next) {
    if (to.name === 'SceneManager' && to.query.taskId == null) {
      Message.error('进入“场景管理页面”需要传递taskId！已帮你重定向到“任务管理页面”');
      next({ name: 'TaskManager' }); // 重定向到任务管理
    }
    next();
  }
};
</script>

<style lang="scss" scoped></style>
