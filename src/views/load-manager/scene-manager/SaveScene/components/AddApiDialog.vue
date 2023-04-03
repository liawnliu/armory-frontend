<template>
  <el-dialog title="选择接口" :visible.sync="dialogVisible" top="10px" :close-on-click-modal="false" @close="clearData">
    <el-table
      ref="table" :data="apiList"
      style="width: 100%" border
      stripe
      @select="handleSelection"
      @select-all="handleSelectionAll"
    >
      <el-table-column align="center" type="selection" width="70" />
      <el-table-column align="header-center" label="接口名称" prop="apiName" />
      <el-table-column align="header-center" label="创建人" width="100" prop="name" />
    </el-table>
    <!-- 表格下方的分页  -->
    <el-pagination
      :current-page.sync="pagination.page"
      :page-size.sync="pagination.size"
      :page-sizes="[10, 20, 30, 40, 50]"
      layout="total, sizes, prev, pager, next"
      :total="pagination.total"
      @size-change="getApiList"
      @current-change="getApiList"
    />
    <div style="margin-top: 20px; text-align: right">
      <el-button type="primary" @click="save(false)">保存</el-button>
      <el-button v-if="allowLink" type="primary" @click="save(true)">保存为链路</el-button>
      <el-button type="danger" @click="completeClose">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getApiList } from '@/api/basic-manager';
import { addApiDialogEvent, selectProjectDialogEvent } from '@/config/event.js';
export default {
  name: 'AddApiDialog',
  data() {
    return {
      pagination: { size: 10, page: 1, total: 0 },
      dialogVisible: false,
      apiList: [],
      checkList: [],
      closeFlag: '',
      projectName: '',
      allowLink: true,
      finishFun: () => {}
    };
  },
  mounted() {
    this.$bus.$on(addApiDialogEvent, param => {
      this.dialogVisible = true;
      const { projectId, flag, projectName, allowLink, finishFun } = param;
      this.projectName = projectName;
      this.allowLink = allowLink;
      this.finishFun = finishFun;
      this.getApiList({ projectId, flag });
    });
  },
  beforeDestroy() {
    this.$bus.$off(addApiDialogEvent); // 事件解绑
  },
  methods: {
    async getApiList(params) {
      try {
        params = Object.assign(this.pagination, params || {});
        const { content } = await getApiList(params);
        if (content == null) return;
        this.apiList = content.list;
        this.pagination.total = content.total;
        this.$nextTick(() => {
          this.initSelection();
        });
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    initSelection() {
      for (let i = 0; i < this.apiList.length; i++) {
        const api = this.apiList[i];
        let contain = false;
        for (let j = 0; j < this.checkList.length; j++) {
          const item = this.checkList[j];
          if (item.id === api.id) {
            contain = true;
            break;
          }
        }
        this.$refs.table.toggleRowSelection(api, contain);
      }
    },
    // 当勾选表格某一项（全选）时触发，val就是表格目前勾选了哪些项
    handleSelection(selection, row) {
      console.log(' handleSelection selection', selection);
      console.log('row', row);
      // 勾选了or取消勾选
      const select = selection.some(item => item.id === row.id);
      // 当前这一项row经过toSelect处理
      this.toSelect(row, select);
      console.log('handleSelection this.checkList', this.checkList);
    },
    // 让row勾选还是取消勾选
    toSelect(row, select) {
      // 是否已存在
      let containIndex = -1;
      for (let index = 0; index < this.checkList.length; index++) {
        const item = this.checkList[index];
        if (item.id === row.id) {
          containIndex = index;
          break;
        }
      }
      if (select) {
        // 现在勾选，但还不存在于checkList，那么就添加到checkList
        if (containIndex === -1) {
          this.checkList.push(row);
        }
      } else {
        // 现在取消勾选了，以前还存在于checkList，那么从checkList里删除
        if (containIndex !== -1) {
          this.checkList.splice(containIndex, 1);
        }
      }
    },
    handleSelectionAll(selection) {
      console.log('handleSelectionAll selection', selection);
      const select = !!selection.length;
      for (let i = 0; i < this.apiList.length; i++) {
        const api = this.apiList[i];
        // 每项都要经过toSelect的处理
        this.toSelect(api, select);
      }
      console.log('handleSelectionAll this.checkList', this.checkList);
    },
    save(isLink) {
      const apiList = [];
      for (let i = 0; i < this.checkList.length; i++) {
        const api = this.checkList[i];
        const { id, projectId, projectName, apiName, name, protocolType, methodType, apiUrl } = api;
        apiList.push({
          projectApiId: id,
          projectId,
          projectName,
          apiName,
          name,
          protocolType,
          methodType,
          apiUrl,
          targetRt: '',
          targetTps: ''
        });
      }
      console.log('保存', apiList);
      if (!apiList.length) return;
      this.finishFun({ apiList, isLink });
      this.closeFlag = 'complete';
      this.dialogVisible = false;
    },
    completeClose() {
      this.closeFlag = 'complete';
      this.dialogVisible = false; // 会触发@close事件也就是自动调用clearData
    },
    clearData() {
      this.apiList = [];
      this.checkList = [];
      // 如果是完全关闭就不会去打开SelectProjectDialog，点右上角的叉会再打开SelectProjectDialog
      if (!this.closeFlag) {
        this.$bus.$emit(selectProjectDialogEvent);
      }
      this.closeFlag = '';
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
  }
}
</style>
