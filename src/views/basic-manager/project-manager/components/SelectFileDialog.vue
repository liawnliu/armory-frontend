<template>
  <el-dialog
    :visible.sync="dialogVisible" title="选择已有文件"
    width="70%" :close-on-click-modal="false"
    @close="dialogClose"
  >
    <el-table ref="table" :data="fileList" border stripe @select="handleSelect">
      <el-table-column align="center" label="选择" type="selection" width="55" />
      <el-table-column align="center" label="文件名称" prop="fileName" width="120" />
      <el-table-column align="center" label="文件大小" prop="fileSize" width="80" />
      <el-table-column align="center" label="文件行数" prop="fileCount" width="80" />
      <el-table-column align="center" label="上传时间" prop="uploadTime" />
      <el-table-column align="center" label="创建人" prop="userName" width="150" />
      <el-table-column align="center" label="操作" width="180">
        <div slot-scope="scope" class="handle-area">
          <el-button type="primary" @click="handlePreview(scope.row)">预览</el-button>
          <el-button type="primary" @click="handleDownload(scope.row)">下载</el-button>
          <el-button type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </div>
      </el-table-column>
    </el-table>
    <!-- 表格下方的分页  -->
    <el-pagination
      :current-page.sync="pagination.page"
      :page-size.sync="pagination.size"
      :page-sizes="[10, 20, 30, 40, 50]"
      layout="total, sizes, prev, pager, next"
      :total="pagination.total"
      @size-change="getFileList"
      @current-change="getFileList"
    />
    <div style="text-align: right">
      <el-button type="primary" @click="saveSelect">保存</el-button>
      <el-button type="danger" @click="dialogVisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getFileList, deleteFile, previewFile, downloadFile } from '@/api/basic-manager';
import { selectFileDialogEvent, showFileContentDialogEvent } from '@/config/event';
import { toDownloadFile } from '@/utils/index.js';
export default {
  name: 'SelectFileDialog',
  data() {
    return {
      dialogVisible: false,
      changeFile: null,
      createUserId: '',
      fileList: [],
      pagination: { size: 10, page: 1, total: 0 },
      selectRow: null
    };
  },
  computed: {
    urlBaseMsg() {
      return `${location.origin}${process.env.VUE_APP_BASE_API}`;
    }
  },
  mounted() {
    this.$bus.$on(selectFileDialogEvent, ({ createUserId, changeFile }) => {
      this.createUserId = createUserId;
      this.changeFile = changeFile;
      this.dialogVisible = true;
      this.getFileList();
    });
  },
  beforeDestroy() {
    this.$bus.$off(selectFileDialogEvent); // 事件解绑
  },
  methods: {
    async getFileList() {
      try {
        const { page, size } = this.pagination;
        const { content } = await getFileList({ page, size });
        if (content == null) return;
        this.pagination.total = content.total;
        this.fileList = content.list;
      } catch (error) {
        this.$message({ type: 'error', message: error.message });
      }
    },
    // 实现单选
    handleSelect(selection, row) {
      // 保存最新的选项
      this.selectRow = row;
      // 除了row，其他选项要置为false
      selection.forEach(item => {
        if (item.id !== row.id) {
          this.$refs.table.toggleRowSelection(item, false);
        }
      });
    },
    saveSelect() {
      if (!this.selectRow || !this.selectRow.fileName) {
        this.$message({ type: 'error', message: '请先选择一个文件！' });
        return;
      }
      this.changeFile(this.selectRow.fileName);
      this.$message({ type: 'success', message: '选择文件成功！' });
      this.dialogVisible = false;
    },
    // 预览文件
    async handlePreview({ id }) {
      try {
        const { content } = await previewFile({ id });
        this.$bus.$emit(showFileContentDialogEvent, { content });
      } catch (error) {
        this.$message({ type: 'error', message: error.message });
      }
    },
    async handleDownload({ fileName }) {
      try {
        const content = await downloadFile({ fileName, createUserId: this.createUserId });
        console.log('handleDownload', content);
        // 前端下载文件
        toDownloadFile(content, fileName);
      } catch ({ message }) {
        this.$message({ type: 'error', message: message });
      }
    },
    // 删除文件
    async handleDelete({ id }) {
      try {
        await this.$confirm('您是否确定要删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        await deleteFile({ id });
        this.$message({ type: 'success', message: '删除成功！' });
        this.getFileList();
      } catch (error) {
        if (error === 'cancel') return;
        this.$message({ type: 'error', message: error.message });
      }
    },
    dialogClose() {
      // 清空选项
      this.$refs.table.clearSelection();
      this.selectRow = null;
    }
  }
};
</script>

<style lang='scss' scoped>
::v-deep {
  .el-dialog {
    .el-table {
      font-size: 14px;
      thead tr th:first-child .el-checkbox {
        display: none;
      }
      thead tr th:first-child .cell {
        &::after {
          content: '选择';
          font-weight: 700;
          color: #909399;
        }
      }
    }
    .el-dialog__body {
      padding-top: 10px;
    }
    .handle-area{
      display: flex;
      justify-content: space-around;
    }
    .el-pagination {
      margin: 10px 10px 20px 0;
      text-align: right;
    }
  }
}
</style>
