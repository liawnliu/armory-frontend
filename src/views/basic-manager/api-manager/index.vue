<template>
  <CommTemplate>
    <ContentTemplate
      :handle-area="{ addBtnName: '新增接口', addBtnAuth: ['basic:api:save'], placeholder: '输入接口名称...' }"
      :pagination.sync="pagination"
      @addItem="addApi"
      @searItem="getApiList({ keyword: $event })"
      @paginationChange="getApiList"
    >
      <ApiTable :api-list="apiList" :project-id="projectId" /><!-- 显示接口列表 -->
    </ContentTemplate>
  </CommTemplate>
</template>

<script>
import { Message } from 'element-ui';
import CommTemplate from '@/views/common/CommTemplate.vue';
import ContentTemplate from '@/views/common/ContentTemplate.vue';
import { getApiList } from '@/api/basic-manager';
import ApiTable from './components/ApiTable.vue';
import { handleGetApiListResponse } from './scripts/handle-data.js';
export default {
  name: 'ApiManager',
  components: {
    CommTemplate,
    ContentTemplate,
    ApiTable
  },
  data() {
    return {
      projectId: this.$route.query.projectId,
      // 接口列表，会通过props方式传递给ApiTable组件，接口每次更新也会更新接口列表
      apiList: [],
      // 分页信息，会通过props方式传递给ContentTemplate组件，接口每次更新也会更新这个分页信息
      pagination: { size: 10, page: 1, total: 0 }
    };
  },
  // 提供给后代getProjectList方法，可以用来触发向服务器请求最新的工程列表。并没有直接将this提供出去，这样很危险
  provide() {
    return {
      getApiList: this.getApiList
    };
  },
  created() {
    this.getApiList(); // 向服务请求接口列表
  },
  methods: {
    // 向服务器请求接口列表
    async getApiList(params) {
      try {
        params = Object.assign({ keyword: '', projectId: this.projectId }, this.pagination, params || {});
        const { content } = await getApiList(params); // 向服务器请求接口列表
        console.log('getApiList content', content);
        const data = handleGetApiListResponse(content); // 将后端数据处理成前端数据
        if (!data) return;
        this.pagination.total = data.total; // 更新ContentTemplate的分页信息
        this.apiList = data.apiList; // 更新ApiTable需要的apiList
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    // 添加新接口
    addApi() {
      // 切换路由
      this.$router.push({
        name: 'SaveApi',
        query: {
          projectId: this.projectId
        }
      });
    }
  },
  // 通过路由规则进入组件时被调用，此时组件实例还未生成
  beforeRouteEnter(to, from, next) {
    if (to.query.projectId == null) {
      // 组件实例还未生成，所以不能使用this.$message，那么就用Message
      Message.error('进入“接口管理页面”需要传递projectId！已帮你重定向到“工程管理页面”');
      next({ name: 'ProjectManager' }); // 重定向到工程管理
    }
    next();
  },
  // 路由地址改变，包括浏览器地址后面的参数被去掉再回车，就会触发这个钩子
  beforeRouteUpdate(to, from, next) {
    // 只验证本组件的
    if (to.name === 'ApiManager' && to.query.projectId == null) {
      Message.error('进入“接口管理页面”需要传递projectId！已帮你重定向到“工程管理页面”');
      next({ name: 'ProjectManager' }); // 重定向到工程管理
    }
    next();
  }
};
</script>

<style lang="scss" scoped></style>
