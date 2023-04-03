<template>
  <el-dropdown trigger="click" @command="handleSetSize">
    <div>
      <svg-icon class-name="size-icon" icon-class="size" />
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item
        v-for="item of sizeOptions" :key="item.value"
        :disabled="size===item.value"
        :command="item.value"
      >
        {{ item.label }}
      </el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  data() {
    return {
      sizeOptions: [
        { label: 'Default', value: 'default' },
        { label: 'Medium', value: 'medium' },
        { label: 'Small', value: 'small' },
        { label: 'Mini', value: 'mini' }
      ]
    };
  },
  computed: {
    size() {
      return this.$store.getters.size;
    }
  },
  methods: {
    handleSetSize(size) {
      // main.js里引入ElementUI时加了size配置项，会加到Vue.prototype.$ELEMENT.size。这里是为了刷新SizeSelect自身的Size
      this.$ELEMENT.size = size;
      // 重置cookie里的size
      this.$store.dispatch('app/setSize', size);
      // 刷新app-main区域的size
      this.refreshView();
      this.$message({ message: '切换组件/文字大小成功', type: 'success' });
    },
    // 刷新app-main区域视图
    refreshView() {
      // 从cachedViews中删除当前路由页面的缓存
      this.$store.dispatch('tagsView/delAllCachedViews', this.$route);
      // 将当前路由的地址保存一下
      const { fullPath } = this.$route;
      console.log('refreshView fullPath', fullPath);
      // 跳到重定向路由，然后会给你重定向回来，相当于本路由界面重新刷新了（刷新视图）
      this.$nextTick(() => {
        this.$router.replace({
          path: '/redirect' + fullPath
        });
      });
    }
  }

};
</script>
