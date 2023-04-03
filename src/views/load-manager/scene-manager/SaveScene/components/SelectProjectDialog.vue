<template>
  <el-dialog
    title="选择工程" :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    @open="getProjectList" @close="clearData"
  >
    <el-table :data="projectList" style="width: 100%" border stripe>
      <el-table-column align="header-center" label="工程名称">
        <template slot-scope="scope">
          <a style="text-decoration-line: underline" @click="toSelectApi(scope.$index)">{{
            scope.row.projectName
          }}</a>
        </template>
      </el-table-column>
      <el-table-column align="header-center" prop="userName" label="创建人" />
    </el-table>
    <!-- 表格下方的分页  -->
    <el-pagination
      :current-page.sync="pagination.page"
      :page-size.sync="pagination.size"
      :page-sizes="[10, 20, 30, 40, 50]"
      layout="total, sizes, prev, pager, next"
      :total="pagination.total"
      @size-change="getProjectList"
      @current-change="getProjectList"
    />
    <div style="clear: both" />
  </el-dialog>
</template>

<script>
import { getProjectList } from '@/api/basic-manager';
import { selectProjectDialogEvent, addApiDialogEvent } from '@/config/event';
export default {
  name: 'SelectProjectDialog',
  data() {
    return {
      allowLink: true,
      finishFun: () => {},
      projectList: [],
      pagination: { size: 10, page: 1, total: 0 },
      dialogVisible: false
    };
  },
  mounted() {
    this.$bus.$on(selectProjectDialogEvent, ({ allowLink, finishFun }) => {
      this.allowLink = allowLink;
      this.finishFun = finishFun;
      this.dialogVisible = true;
    });
  },
  beforeDestroy() {
    this.$bus.$off(selectProjectDialogEvent); // 事件解绑
  },
  methods: {
    async getProjectList() {
      try {
        const { page, size } = this.pagination;
        const { content } = await getProjectList({ page, size });
        if (content == null) return;
        this.projectList = content.list;
        this.pagination.total = content.total;
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    toSelectApi(index) {
      console.log('index', index);
      const projectId = this.projectList[index].id;
      const projectName = this.projectList[index].projectName;
      this.dialogVisible = false;
      this.$bus.$emit(addApiDialogEvent, {
        projectId,
        flag: false,
        projectName,
        allowLink: this.allowLink,
        finishFun: this.finishFun
      });
    },
    clearData() {
      this.projectList = [];
      this.pagination = { size: 10, page: 1, total: 0 };
    }
  }
};
</script>

<style lang="scss" scoped>
::v-deep {
  .el-dialog {
    .el-table {
      font-size: 14px;
    }
    .el-dialog__body {
      padding-top: 10px;
    }
    .el-pagination {
      margin-top: 20px;
      float: right;
    }
  }
}
</style>
