<template>
  <el-table :data="apiList" style="width: 100%" border stripe>
    <!-- align对齐方式，label列名 -->
    <el-table-column align="center" label="接口ID" prop="id" width="160" />
    <el-table-column align="center" label="接口名称" prop="apiName" />
    <el-table-column align="center" label="接口类型" prop="methodName" width="100" />
    <el-table-column align="center" label="接口URL" prop="apiUrl" />
    <el-table-column align="header-center" label="创建人" prop="name" width="120" />
    <el-table-column align="center" label="操作" width="200">
      <template slot-scope="scope">
        <el-button v-btn-auth="['basic:api:save']" type="primary" @click="editItem(scope)">编辑</el-button>
        <el-button v-btn-auth="['basic:api:copy']" type="warning" @click="copyItem(scope)">复制</el-button>
        <el-button v-btn-auth="['basic:api:delete']" type="danger" @click="deleteItem(scope)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import { deleteApi, copyApi } from '@/api/basic-manager';
export default {
  name: 'ApiTable',
  props: {
    apiList: { type: Array, required: false, default: () => [] },
    projectId: { type: [Number, String], required: true }
  },
  data() {
    return { };
  },
  // 依赖注入，获取祖先ApiManager/index.vue提供的getApiList，用来请求最新的接口列表
  // 依赖注入一般用来获取祖先提供的方法。虽然可以提供数据，但是提供的数据不是响应式的，那就只能EventBus或者Vuex
  inject: ['getApiList'],
  methods: {
    editItem(scope) {
      if (!scope.row || scope.row.id == null) return;
      console.log('editItem', scope.row);
      // 编辑接口是一个新页面，需要切换路由
      this.$router.push({
        name: 'SaveApi',
        query: {
          projectId: this.projectId,
          apiId: scope.row.id
        }
      });
    },
    async deleteItem(scope) {
      if (!scope.row || scope.row.id == null) return;
      console.log('deleteItem', scope.row);
      try {
        await this.$confirm('您是否确定要删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        // 调后端接口去删除api
        await deleteApi({ id: scope.row.id });
        this.$message({ type: 'success', message: '删除成功!' });
        // 使用inject“依赖注入”的方法，通知主页面去更新ApiList
        this.getApiList();
      } catch (error) {
        if (error === 'cancel') return;
        this.$message({ type: 'error', message: error.message });
      }
    },
    async copyItem(scope) {
      if (!scope.row || scope.row.id == null) return;
      console.log('copyItem', scope.row);
      try {
        await copyApi({ id: scope.row.id }); // 请求后端接口去复制
        this.$message({ type: 'success', message: '复制成功，请注意修改接口对应配置！' });
        // 使用inject“依赖注入”的方法，通知主页面去更新ApiList
        this.getApiList();
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.table-api-name {
  text-decoration-line: underline;
}
</style>
