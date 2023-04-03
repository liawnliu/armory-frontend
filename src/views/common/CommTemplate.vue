<template>
  <div>
    <div class="main-wrap">
      <!-- 当前页面title -->
      <div class="main-title">
        <h3>{{ finalTitle }}</h3>
      </div>
      <!-- title下面的主要显示区域 -->
      <div class="main-panel">
        <!-- 中间内容，默认插槽就行了 -->
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CommTemplate',
  props: {
    component: { type: String, required: false, default: '' }, // 页面component
    title: { type: String, required: false, default: '' } // 页面title
  },
  data() {
    return {
      finalTitle: this.title ? (this.$route.meta.title = this.title) : this.$route.meta.title
    };
  }
};
</script>

<style lang="scss">
@import '~@/styles/mixin.scss';
.main-wrap {
  min-height: inherit;
  padding: 5px 10px 0;
  background-color: #f7f7f7;
  .main-title {
    padding: 5px 0;
    h3 {
      color: #73879c;
      font-size: 20px;
      margin: 5px 0;
      font-weight: 500;
      line-height: 1.1;
    }
  }
  .main-panel {
    /* position: relative; */
    width: 100%;
    margin-bottom: 5px;
    padding: 10px;
    /* display: inline-block; */
    background: #fff;
    border: 1px solid #e6e9ed;
    -webkit-column-break-inside: avoid;
    -moz-column-break-inside: avoid;
    opacity: 1;
    -moz-transition: all 0.2s ease;
    -o-transition: all 0.2s ease;
    -webkit-transition: all 0.2s ease;
    -ms-transition: all 0.2s ease;
    transition: all 0.2s ease;
    @include clearfix;
  }
  /* 自定义table样式 */
  .el-table {
    border: 1px solid #ccc;
    th {
      background-color: #f5f5f5; /* 表头设置显眼一点 */
      border-bottom: 3px solid #ebeef5;
    }
    th,
    td {
      border-color: #dcdfe6;
    }
    .el-button {
      padding: 6px 8px;
    }
  }
  .el-form {
    .el-form-item__label {
      padding-right: 15px; /* 让label和input之间的空白距离 */
    }
    .el-input__inner,
    .el-textarea__inner {
      border: 1px solid #ccc; /* 输入控件的边框样式 */
    }
    /* 下拉框 */
    .el-select {
      width: 100%;
    }
  }
  .el-form-item.error-msg {
    /* 带X关闭按钮的校验错误信息 */
    .el-form-item__error {
      position: absolute;
      display: inline-block;
      top: 25%;
      right: 25px;
      text-align: right;
      &::after {
        content: '\00D7';
        color: #fff;
        text-align: center;
        line-height: 13px;
        position: absolute;
        display: block;
        width: 13px;
        height: 13px;
        border-radius: 13px;
        background-color: #f56c6c;
        right: -14px;
        top: 16%;
      }
    }
  }
}
</style>
