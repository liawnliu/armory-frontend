<template>
  <el-dialog :visible.sync="dialogVisible" :title="dialogTitle" :close-on-click-modal="false" width="300px" top="60px">
    <el-scrollbar style="height: 450px">
      <ListTree :list="list" :label="label" :click-fun="clickFun" />
    </el-scrollbar>
  </el-dialog>
</template>

<script>
import { listTreeDialogEvent } from '@/config/event.js';
import ListTree from './components/ListTree.vue';
export default {
  name: 'ListTreeDialog',
  components: { ListTree },
  data() {
    return {
      dialogTitle: '', // 弹窗标题
      list: [], // 树形展示数据
      updateData: null, // 从外部传入dialog的回调函数
      banId: null, // 不被选择的那项id
      dialogVisible: false,
      label: 'name'
    };
  },
  mounted() {
    this.$bus.$on(listTreeDialogEvent, this.showOrHide);
  },
  beforeDestroy() {
    this.$bus.$off(listTreeDialogEvent);
  },
  methods: {
    showOrHide({ dialogTitle, list, updateData, banId, label }) {
      this.dialogTitle = dialogTitle;
      this.list = list;
      this.updateData = updateData;
      this.banId = banId;
      this.dialogVisible = true;
      this.label = label;
    },
    clickFun({ data, dataList }) {
      if (this.banId != null && this.banId.length && this.banId.includes(data.id)) {
        this.$message({ type: 'error', message: `不能选择${data.label}！` });
        return;
      }
      this.updateData({ data, dataList });
      this.dialogVisible = false;
    }
  }
};
</script>

<style lang='scss' scoped>
::v-deep {
  .el-dialog__body{
    padding: 5px 10px;
  }
  /* 隐藏水平滚动条 */
  .el-scrollbar__wrap{
    overflow-x: hidden;
  }
}
</style>
