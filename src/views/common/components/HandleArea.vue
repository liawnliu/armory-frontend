<template>
  <!-- 左侧新增按钮（这是顺带功能，可以隐藏），右侧的搜索栏（这是主要功能不能隐藏） -->
  <div class="handle-area">
    <el-button
      v-if="addBtnVisible" v-btn-auth="addBtnAuth"
      type="primary"
      round class="add-btn"
      @click="$emit('addItem')"
    >
      {{ addBtnName }}
    </el-button>
    <el-input v-model="keyWord" :placeholder="placeholder" class="input-with-select">
      <el-button slot="append" icon="el-icon-search" @click="$emit('searItem', keyWord)">搜索</el-button>
    </el-input>
  </div>
</template>

<script>
export default {
  name: 'HandleArea',
  props: {
    handleArea: {
      type: Object,
      required: false
    }
  },
  data() {
    return { keyWord: '' };
  },
  computed: {
    // addBtnVisible是否显示左侧按钮，addBtnName左侧按钮的名称
    addBtnVisible() {
      if (this.handleArea && Object.prototype.hasOwnProperty.call(this.handleArea, 'addBtnVisible')) {
        return this.handleArea.addBtnVisible;
      }
      return true; // 通过props传进来的handleArea没有addBtnVisible属性，那我们默认展示新增按钮
    },
    addBtnAuth() {
      if (this.handleArea && Object.prototype.hasOwnProperty.call(this.handleArea, 'addBtnAuth')) {
        return this.handleArea.addBtnAuth;
      }
      return [];
    },
    addBtnName() {
      if (this.handleArea && Object.prototype.hasOwnProperty.call(this.handleArea, 'addBtnName')) {
        return this.handleArea.addBtnName;
      }
      return '新增'; // 通过props传进来的handleArea没有addBtnName属性，那我们默认展示‘新增’
    },
    placeholder() {
      if (this.handleArea && Object.prototype.hasOwnProperty.call(this.handleArea, 'placeholder')) {
        return this.handleArea.placeholder;
      }
      return '请输入名称...'; // 通过props传进来的handleArea没有placeholder属性，那我们默认展示‘请输入名称...’
    }
  },
  beforeDestroy() {
    this.$off(); // 一键解绑所有事件
  }
};
</script>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
.handle-area {
  width: 100%;
  margin: 30px 0 10px 0;
  .add-btn {
    float: left;
  }
  .input-with-select {
    float: right;
    width: 41%;
    input {
      border-radius: 50px;
    }
  }
  @include clearfix
}
</style>
