<template>
  <el-dialog
    :visible.sync="dialogVisible" title="文件预览（前10行）"
    width="80%" top="25px"
    :close-on-click-modal="false"
    @close="dialogClose"
  >
    <div class="content" v-html="content" />
    <el-button type="danger" @click="dialogVisible = false">关闭</el-button>
  </el-dialog>
</template>

<script>
import { showFileContentDialogEvent } from '@/config/event';
export default {
  name: 'ShowFileContentDialog',
  data() {
    return {
      dialogVisible: false,
      content: ''
    };
  },
  mounted() {
    this.$bus.$on(showFileContentDialogEvent, ({ content }) => {
      this.content = content;
      this.dialogVisible = true;
    });
  },
  beforeDestroy() {
    this.$bus.$off(showFileContentDialogEvent); // 事件解绑
  },
  methods: {
    dialogClose() {
      this.content = '';
    }
  }
};
</script>

<style lang='scss' scoped>
@import '~@/styles/mixin.scss';
::v-deep {
  .el-dialog__header{
    border-bottom: 1px solid #ccc;
  }
  .el-dialog__body {
    .content {
      min-height: 400px;
      margin: 10px 10px 20px 10px;
      padding: 10px 20px;
      background-color: #f3f3f3;
    }
    .el-button {
      float: right;
      margin-right: 10px;
    }
    /* 用父级的伪元素来清除浮动 */
    @include clearfix
  }
}
</style>
