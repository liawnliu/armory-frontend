<template>
  <div :class="{ 'has-logo': showLogo }">
    <!-- 是否在sidebar上方展示LOGO -->
    <logo v-if="showLogo" :collapse="isCollapse" />
    <!-- el-scrollbar是一个带滚动条的容器 -->
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <!-- el-menu菜单，mode水平还是垂直，collapse是否折叠，default-active当前激活菜单的index -->
      <!-- unique-opened是否只保持一个子菜单的展开，collapse-transition，是否开启折叠动画 -->
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :background-color="variables.menuBg"
        :text-color="variables.menuText"
        :unique-opened="false"
        :active-text-color="variables.menuActiveText"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="route in menuList"
          :key="route.name"
          :item="route"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Logo from './Logo';
import SidebarItem from './SidebarItem';
import variables from '@/styles/variables.scss';

export default {
  components: { SidebarItem, Logo },
  data() {
    return {
      activeMenu: ''
    };
  },
  computed: {
    ...mapGetters(['sidebar', 'menuList']),
    showLogo() {
      return this.$store.state.settings.sidebarLogo;
    },
    variables() {
      return variables;
    },
    isCollapse() {
      return !this.sidebar.opened;
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(val) {
        const { meta, name } = val;
        const { showInSidebar, breadCrumbList, activeMenu } = meta;
        if (showInSidebar) {
          // 如果当前路由正常显示在sidebar，那么在sidebar里直接显示它的name
          this.activeMenu = name;
        } else {
          // 如果当前路由不能在sidebar里展示，那么先看meta里有没有存activeMenu
          if (activeMenu) {
            this.activeMenu = activeMenu;
          } else {
            let actMenu = '';
            console.log('Sidebar watch breadCrumbList', breadCrumbList);
            // 没有存的话从面包屑了找它“业务层次”的祖先节点，如果有一个最近祖先是显示在sidebar的，那就展示这个祖先的name
            if (breadCrumbList && breadCrumbList.length > 2) {
              for (let index = breadCrumbList.length - 2; index > 0; index--) {
                const item = breadCrumbList[index];
                console.log('Sidebar watch item', item);
                // 是目录就不用它
                if (item.type === 0) continue;
                // 如果item.name对应路由有重定向，那么resolve的结果就是重定向后的路由
                // 当前系统中对于非目录的路由没有做重定向的业务需求，如果后面有重定向的话，这里的activeMenu可能取不准了
                const { route } = this.$router.resolve({ name: item.name });
                // 如果它也不展示，也不用它
                if (route.meta && !route.meta.showInSidebar) continue;
                // 当前系统的路由基本都有name
                actMenu = route.name;
                // 拿到一个就返回
                break;
              }
            }
            // 没有就不展示了吧，极端情况了
            this.activeMenu = actMenu;
          }
        }
      }
    }
  }
};
</script>
