<template>
  <div :class="classObj" class="app-wrapper">
    <!-- 移动端处理 -->
    <div
      v-if="device === 'mobile' && sidebar.opened"
      class="drawer-bg"
      @click="handleClickOutside"
    />
    <!-- 侧边栏 -->
    <sidebar class="sidebar-container" />
    <!-- 侧边栏的右侧div -->
    <div :class="{hasTagsView:needTagsView}" class="main-container">
      <!-- 顶部导航区 -->
      <div :class="{ 'fixed-header': fixedHeader }">
        <!-- 导航栏 -->
        <navbar />
        <!-- 快捷入口/历史标签入口 -->
        <tags-view v-if="needTagsView" />
      </div>
      <!-- 中间内容展示区 -->
      <app-main />
      <!-- 右侧悬浮的一些按钮，以及按钮对应的抽屉 -->
      <right-panel />
    </div>
  </div>
</template>

<script>
import RightPanel from '@/components/RightPanel';
import { Navbar, Sidebar, AppMain, TagsView } from './components';
import ResizeMixin from './mixin/ResizeHandler';
import { mapState } from 'vuex';

export default {
  name: 'Layout',
  components: {
    Navbar,
    RightPanel,
    Sidebar,
    AppMain,
    TagsView
  },
  mixins: [ResizeMixin],
  computed: {
    ...mapState({
      sidebar: state => state.app.sidebar,
      device: state => state.app.device,
      needTagsView: state => state.settings.tagsView,
      fixedHeader: state => state.settings.fixedHeader
    }),
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      };
    }
  },
  methods: {
    handleClickOutside() {
      this.$store.dispatch('app/closeSideBar', { withoutAnimation: false });
    }
  }
};
</script>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
@import '~@/styles/variables.scss';

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;
  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}
.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$sideBarWidth});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

.mobile .fixed-header {
  width: 100%;
}
</style>
