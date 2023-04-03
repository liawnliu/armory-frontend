<template>
  <el-breadcrumb class="app-breadcrumb" separator="/">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in levelList" :key="item.name">
        <!-- 最后一项是当前路由本身所以无法点击，然后是'noRedirect'的也不能点击 -->
        <span
          v-if="item.redirect === 'noRedirect' || index == levelList.length - 1"
          class="no-redirect"
        >{{
          item.meta ? item.meta.title : item.label
        }}</span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta ? item.meta.title : item.label }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script>
import pathToRegexp from 'path-to-regexp';
// 面包屑
export default {
  data() {
    return {
      levelList: null
    };
  },
  watch: {
    $route() {
      this.getBreadcrumb();
    }
  },
  created() {
    this.getBreadcrumb();
  },
  methods: {
    getBreadcrumb() {
      console.log('getBreadcrumb this.$route', this.$route);
      // 如有单独配置面包屑信息（在资源管理里配置），那就直接使用它，否则就使用this.$route.matched
      let breadCrumbList = null;
      if (this.$route.meta.breadCrumbList) {
        // 我们在资源管理配置的面包屑，第一个就已经是主页了
        breadCrumbList = this.$route.meta.breadCrumbList;
      } else {
        breadCrumbList = this.$route.matched.filter(item => item.meta && item.meta.title);
        const first = breadCrumbList[0];
        // 面包屑里第一个展示的得是主页
        if (!this.isHome(first)) {
          breadCrumbList = [{ path: '/home', name: 'Home', meta: { title: 'Armory' }}].concat(breadCrumbList);
        }
      }
      console.log('breadCrumbList', breadCrumbList);
      // 过滤掉没有title和breadcrumb为false的（不想展示在面包屑）
      this.levelList = breadCrumbList.filter(item => item.meta == null || item.meta.breadcrumb !== false);
    },
    // 是否是主页
    isHome(route) {
      const name = route && route.name;
      if (!name) {
        return false;
      }
      return name.trim().toLocaleLowerCase() === 'Home'.toLocaleLowerCase();
    },
    /*
      获取带有params的完整path
      cosnt path = '/user/:id/:name'
      const params = {id: 10001, name: 'bob'}
      将path和params合并成"/user/10001/bob"
    */
    pathCompile(path) {
      // To solve this problem https://github.com/PanJiaChen/vue-element-admin/issues/561
      const { params } = this.$route;
      // 用path-to-regexp插件处理path，将params快速填充到 path 的字符串形式的参数上
      const toPath = pathToRegexp.compile(path);
      return toPath(params);
    },
    // 点击面包屑里的路径，要处理params和query参数
    handleLink(item) {
      console.log('Breadcrumb handleLink item', item);
      const { redirect, path, name } = item;
      // 是重定向那就重定向
      if (redirect) {
        this.$router.push(redirect);
        return;
      }
      // 如果path存在那就直接跳转对应的path，但要是完整的path
      if (path) {
        this.$router.push(this.pathCompile(path));
      } else if (name) {
        // 如果采用的是name（我们这个系统绝大部分用的是name），就先看TagsView的visitedViews里有没有
        const route = this.$store.getters.visitedViews.find(item => item.name === name);
        console.log('Breadcrumb handleLink route', route);
        // 有的话就直接跳转过滤到的route
        if (route) {
          // 如果TagsView里有对应的路由信息，就直接使用它来跳转，都不用考虑处理params和query
          this.$router.push(route);
        } else {
          /*
            TagsView里没有，那么直接跳name对应的组件，但是query参数就临时使用this.$route的query
            为什么跳其他路由要用当前路由的query？
            因为当业务之间是嵌套关系时（比如要传task，sceneId等），在切换的时候上一个路由的query是没法
            保存的（前提是TagsView功能没开启）。那么在切换或刷新页面时，query参数命名要语义化，保证页面
            切换后能正常拿到参数
          */
          console.log('this.$route.query', this.$route.query);
          this.$router.push({ name, query: this.$route.query, params: this.$route.params });
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  display: inline-block;
  font-size: 14px;
  line-height: 50px;
  margin-left: 8px;

  .no-redirect {
    color: #97a8be;
    cursor: text;
  }
}
</style>
