<template>
  <div id="tags-view-container" class="tags-view-container">
    <scroll-pane ref="scrollPane" class="tags-view-wrapper" @scroll="handleScroll">
      <router-link
        v-for="tag in visitedViews"
        ref="tag"
        :key="tag.path"
        :class="isActive(tag)?'active':''"
        :to="{ path: tag.path, query: tag.query, fullPath: tag.fullPath }"
        tag="span"
        class="tags-view-item"
        @click.middle.native="!isAffix(tag)?closeSelectedTag(tag):''"
        @contextmenu.prevent.native="openMenu(tag,$event)"
      >
        {{ tag.title }}
        <span v-if="!isAffix(tag)" class="el-icon-close" @click.prevent.stop="closeSelectedTag(tag)" />
      </router-link>
    </scroll-pane>
    <ul v-show="visible" :style="{left:left+'px',top:top+'px'}" class="contextmenu">
      <li @click="refreshSelectedTag(selectedTag)">Refresh</li>
      <li v-if="!isAffix(selectedTag)" @click="closeSelectedTag(selectedTag)">Close</li>
      <li @click="closeOthersTags">Close Others</li>
      <li @click="closeAllTags(selectedTag)">Close All</li>
    </ul>
  </div>
</template>

<script>
import ScrollPane from './ScrollPane';
import path from 'path';

export default {
  components: { ScrollPane },
  data() {
    return {
      visible: false,
      top: 0,
      left: 0,
      selectedTag: {},
      affixTags: []
    };
  },
  computed: {
    visitedViews() {
      return this.$store.state.tagsView.visitedViews;
    },
    routes() {
      return this.$store.state.user.menuList;
    }
  },
  watch: {
    // 监视当前路由，只要变化了就将它添加到vuex中
    $route() {
      this.addTags();
      this.moveToCurrentTag();
    },
    visible(value) {
      if (value) {
        document.body.addEventListener('click', this.closeMenu);
      } else {
        document.body.removeEventListener('click', this.closeMenu);
      }
    }
  },
  mounted() {
    this.initTags();
    this.addTags();
  },
  methods: {
    // 判断tag的path是否是当前路由的path
    isActive(route) {
      return route.path === this.$route.path;
    },
    // 判断tag是否是“固定”的
    isAffix(tag) {
      return tag.meta && tag.meta.affix;
    },
    // 从routes中过滤出“固定tags”
    filterAffixTags(routes, basePath = '/') {
      let tags = [];
      routes.forEach(route => {
        // 该路由是否要固定（不允许点击叉）
        if (route.meta && route.meta.affix) {
          // 将route.path解析到basePath的绝对路径里
          const tagPath = path.resolve(basePath, route.path);
          tags.push({
            fullPath: tagPath,
            path: tagPath,
            name: route.name,
            meta: { ...route.meta }
          });
        }
        if (route.children) {
          const tempTags = this.filterAffixTags(route.children, route.path);
          if (tempTags.length >= 1) {
            // 都放都一维数组里
            tags = [...tags, ...tempTags];
          }
        }
      });
      return tags;
    },
    // 初始化TagsView的数据
    initTags() {
      // 过滤出固定的tag，并将它添加到vuex中
      const affixTags = this.affixTags = this.filterAffixTags(this.routes);
      for (const tag of affixTags) {
        // Must have tag name
        if (tag.name) {
          // 只放到visitedViews里，因为只是在TagsView显示出来，还不曾缓存它的路由
          this.$store.dispatch('tagsView/addVisitedView', tag);
        }
      }
    },
    // 将当前路由对应的页面放到visitedViews和cachedViews。它的组件已经渲染过状态也有，所以可以放到cachedViews里
    addTags() {
      const { name } = this.$route;
      if (name) {
        this.$store.dispatch('tagsView/addView', this.$route);
      }
      return false;
    },
    // 移动/滚动到当前路由的tag
    moveToCurrentTag() {
      // 拿到所有的tag元素
      const tags = this.$refs.tag;
      this.$nextTick(() => {
        for (const tag of tags) {
          if (tag.to.path === this.$route.path) {
            // 调用ScrollPane的moveToTarget方法，让tag移动到目标位置
            this.$refs.scrollPane.moveToTarget(tag);
            // 更新后fullPath可能改变了，那么更新一下vuex里的对应数据
            if (tag.to.fullPath !== this.$route.fullPath) {
              this.$store.dispatch('tagsView/updateVisitedView', this.$route);
            }
            break;
          }
        }
      });
    },
    // 右击显示处“选项菜单”，然后点击“Refresh”。刷新tag对应的缓存，相当于重新进入该页面，先删除后添加
    refreshSelectedTag(view) {
      this.$store.dispatch('tagsView/delCachedView', view).then(() => {
        const { fullPath } = view;
        this.$nextTick(() => {
          this.$router.replace({
            path: '/redirect' + fullPath
          });
        });
      });
    },
    // 删除当前所选的tag
    closeSelectedTag(view) {
      // 从vux中删除所选的这个tag
      this.$store.dispatch('tagsView/delView', view).then(({ visitedViews }) => {
        // 如果当前所选的tag就是当前路由，那就得切换到剩余tags中的最后一个
        if (this.isActive(view)) {
          this.toLastView(visitedViews, view);
        }
      });
    },
    // 右击显示处“选项菜单”，然后点击“Close Others”。清空其他所有的tag以及它们的缓存路由（处于固定的不清空），
    closeOthersTags() {
      // 因为要清空其他的了，那先切到selectedTag
      this.$router.push(this.selectedTag);
      // 再去清空
      this.$store.dispatch('tagsView/delOthersViews', this.selectedTag).then(() => {
        // 滚动条位置得更新
        this.moveToCurrentTag();
      });
    },
    // 右击显示处“选项菜单”，然后点击“Close All”。清空所有的tag以及它们的缓存路由（处于固定的不清空），
    closeAllTags(view) {
      this.$store.dispatch('tagsView/delAllViews').then(({ visitedViews }) => {
        // 如果所选tag是固定的，就不用切换到最后一个了
        if (this.affixTags.some(tag => tag.path === view.path)) {
          return;
        }
        // 当前所选不是固定的，那么就切换到最后一个
        this.toLastView(visitedViews, view);
      });
    },
    // 切换到visitedViews里最后一个tag
    toLastView(visitedViews, view) {
      // 移除visitedViews中的最后一项，并将这一项赋值给latestView，和pop()功能是一样的
      const latestView = visitedViews.slice(-1)[0];
      // 切换到latestView
      if (latestView) {
        this.$router.push(latestView.fullPath);
      } else {
        // latestView不存在，表示没有剩余的，那么尝试切换到首页，如果切换之前的view就是Home，那么又重定向到它
        if (view.name === 'Home') {
          this.$router.replace({ path: '/redirect' + view.fullPath });
        } else {
          // 切换到根路径
          this.$router.push('/');
        }
      }
    },
    // 在tag上右击显示“选项菜单”。getBoundingClientRect用于获得页面中某个元素的左，上，右和下分别相对浏览器视窗的位置
    openMenu(tag, e) {
      // 选项菜单自身宽度
      const menuMinWidth = 105;
      // 获取当前TagsView组件左边距离浏览器视窗的距离
      const offsetLeft = this.$el.getBoundingClientRect().left; // container margin left
      // 获取获取当前TagsView组件的宽度（包含边框、内边距以及内容）
      const offsetWidth = this.$el.offsetWidth;
      // 这个差值表示，选项菜单的左边界，与TagsView的左边界，的距离的最大值，因为选项菜单不可能超出TagsView的范围来显示。
      // 最右边的移动范围就是让它们的左边界重叠，最右边的移动范围自然是让它们的右边界重叠
      const maxLeft = offsetWidth - menuMinWidth; // left boundary
      // e.clientX：鼠标相对于浏览器窗口可视区域的X。减去offsetLeft是因为将相对目标由“浏览器窗口”换成了TagsView，再加上15
      // 是因为让选项菜单距离鼠标点击处有个15px间隙
      const left = e.clientX - offsetLeft + 15;
      // 如果left的活动距离超出了限定的maxLeft，那么我们修正left为最大值maxLeft
      if (left > maxLeft) {
        // this.left就是“选项菜单”相对于TagsView左边界的距离，因为有“position: absolute”
        this.left = maxLeft;
      } else {
        this.left = left;
      }
      // top自然就是鼠标相对于浏览器窗口可视区域的Y
      this.top = e.clientY;
      // 显示出选项菜单
      this.visible = true;
      // 在哪个tag上右击，自然记下是哪个tag，以便于选项菜单内部使用
      this.selectedTag = tag;
    },
    // 关闭“选项菜单”
    closeMenu() {
      this.visible = false;
    },
    // 在滚动TagsView，确保“选项菜单”已关闭
    handleScroll() {
      this.closeMenu();
    }
  }
};
</script>

<style lang="scss" scoped>
.tags-view-container {
  height: 34px;
  width: 100%;
  background-color: rgb(237, 237, 237);
  border-bottom: 1px solid rgb(237, 237, 237);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .12), 0 0 3px 0 rgba(0, 0, 0, .04);
  .tags-view-wrapper {
    .tags-view-item {
      display: inline-block;
      position: relative;
      cursor: pointer;
      height: 26px;
      line-height: 26px;
      border: 1px solid #d8dce5;
      color: #495060;
      background: #fff;
      padding: 0 8px;
      font-size: 12px;
      margin-left: 5px;
      margin-top: 4px;
      &:first-of-type {
        margin-left: 15px;
      }
      &:last-of-type {
        margin-right: 15px;
      }
      &.active {
        background-color: #42b983;
        color: #fff;
        border-color: #42b983;
        &::before {
          content: '';
          background: #fff;
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          margin-right: 2px;
        }
      }
    }
  }
  .contextmenu {
    margin: 0;
    background: #fff;
    z-index: 3000;
    position: absolute;
    list-style-type: none;
    padding: 5px 0;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 400;
    color: #333;
    box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, .3);
    li {
      margin: 0;
      padding: 7px 16px;
      cursor: pointer;
      &:hover {
        background: #eee;
      }
    }
  }
}
</style>

<style lang="scss">
//reset element css of el-icon-close
.tags-view-wrapper {
  .tags-view-item {
    .el-icon-close {
      width: 16px;
      height: 16px;
      vertical-align: 2px;
      border-radius: 50%;
      text-align: center;
      transition: all .3s cubic-bezier(.645, .045, .355, 1);
      transform-origin: 100% 50%;
      &:before {
        transform: scale(.6);
        display: inline-block;
        vertical-align: -3px;
      }
      &:hover {
        background-color: #b4bccc;
        color: #fff;
      }
    }
  }
}
</style>
