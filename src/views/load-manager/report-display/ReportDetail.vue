<template>
  <CommTemplate>
    <el-button
      v-btn-auth="['load:reportDetail:download']" class="download-btn"
      type="primary"
      @click="download"
    >导出</el-button>
    <el-tabs v-model="activeName" type="card" @tab-click="activeName === 'single' ? 'mix' : 'single'">
      <el-tab-pane label="单接口" name="single"><SingleIntTable :single-list="singleList" /></el-tab-pane>
      <el-tab-pane label="混合" name="mix"><MixIntTable :mix-list="mixList" /></el-tab-pane>
    </el-tabs>
  </CommTemplate>
</template>

<script>
import CommTemplate from '@/views/common/CommTemplate.vue';
import { getReportDetailList, downloadReport } from '@/api/load-manager';
import MixIntTable from './components/MixIntTable.vue';
import SingleIntTable from './components/SingleIntTable.vue';
import { handleStandard } from '@/utils/handle-standard';
import { toDownloadFile } from '@/utils/index.js';
export default {
  name: 'ReportDetail',
  components: { CommTemplate, SingleIntTable, MixIntTable },
  data() {
    return {
      activeName: 'single',
      singleList: [],
      mixList: [],
      stressName: ''
    };
  },
  created() {
    this.getReportDetailList(this.$route.query.reportId);
  },
  methods: {
    async getReportDetailList(id) {
      try {
        const { content } = await getReportDetailList({ id });
        console.log('getReportDetailList content', content);
        this.singleList = handleStandard(content.single);
        this.mixList = handleStandard(content.mix);
        // stressName
        if (this.singleList.length) {
          this.stressName = this.singleList[0].stressName;
        }
        if (this.mixList.length) {
          this.stressName = this.mixList[0].stressName;
        }
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    async download() {
      if (!this.stressName) {
        this.$message({ type: 'error', message: 'stressName为空无法下载报告！' });
        return;
      }
      try {
        const res = await downloadReport({ resultId: this.$route.query.reportId, tableName: this.stressName });
        console.log('download res', res);
        // 前端下载文件
        toDownloadFile(res, `${this.stressName}.xlsx`);
      } catch (error) {
        this.$message({ type: 'error', message: error.message });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.el-tabs {
  /* display: inline-block; */
  margin-top: 20px;
  ::v-deep {
    .el-tabs__header {
      width: 80%;
    }
    .el-tabs__content {
      margin-top: 20px;
    }
  }
}
.download-btn {
  float: right;
  margin: 20px 20px 0 0;
}
</style>
