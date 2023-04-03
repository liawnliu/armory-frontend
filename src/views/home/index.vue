<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>首页-当前用户信息：</span>
    </div>
    <el-input v-model.lazy="userInfo" class="text item" :autosize="{ minRows: 20, maxRows: 20 }" type="textarea" />
  </el-card>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      userInfo: JSON.stringify(this.$store.getters.user, null, 4)
    };
  }
};
</script>

<style lang="scss" scoped>
.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both
}

.box-card {
  width: 480px;
}
</style>
