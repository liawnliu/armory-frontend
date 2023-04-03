<template>
  <div v-if="!item.hidden">
    <template v-if="onlyOneChild">
      <app-link v-if="onlyOneChild.meta" :to="{name:onlyOneChild.name}">
        <el-menu-item :index="onlyOneChild.name" :class="{'submenu-title-noDropdown':!isNest}">
          <item :icon="onlyOneChild.meta.icon||(item.meta&&item.meta.icon)" :title="onlyOneChild.meta.title" />
        </el-menu-item>
      </app-link>
    </template>

    <el-submenu v-else ref="subMenu" :index="item.name || item.path" popper-append-to-body>
      <template slot="title">
        <item v-if="item.meta" :icon="item.meta && item.meta.icon" :title="item.meta.title" />
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.name"
        :is-nest="true"
        :item="child"
        class="nest-menu"
      />
    </el-submenu>
  </div>
</template>

<script>
import Item from './Item';
import AppLink from './Link';
import FixiOSBug from './FixiOSBug';

export default {
  name: 'SidebarItem',
  components: { Item, AppLink },
  mixins: [FixiOSBug],
  props: {
    item: {
      type: Object,
      required: true
    },
    isNest: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    // 只有一个子项时，是否由该子项代替当前项来显示
    onlyOneChild() {
      const handleOnlyOneChild = parent => {
        // 当前这项没有子项，那么没必要用到el-submenu，则返回当前这项
        if (!parent.children || !parent.children.length) {
          return parent;
        }

        // 当前这项有子项，过滤出可见的子项
        const childArr = parent.children.filter(item => !item.hidden);

        // 当前这项没有可见的子项，那么没必要用到el-submenu，则返回当前这项
        if (!childArr.length) {
          return this.item;
        }

        // 当前这项有1个以上的可见的子项，那需要用到el-submenu，则返回false
        if (childArr.length > 1) {
          return false;
        }

        // alwaysShow字段为true，表示一直显示根路由，需要用到el-submenu，那么返回false
        if (parent.alwaysShow) return false;

        // 当前这项只有1个可见子项，还需要对这个可见子项做一次判断
        // 比如递归时childArr.length一直为1，最后的可能结果是让最深的那一项作为最终返回值
        return handleOnlyOneChild(childArr[0]);
      };
      return handleOnlyOneChild(this.item);
    }
  }
};
</script>
