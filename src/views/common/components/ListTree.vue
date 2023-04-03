<template>
  <el-tree
    ref="tree"
    style="font-size: 14px"
    :data="list"
    node-key="id"
    :props="{children: 'children',label: label}"
    default-expand-all
    empty-text="暂无数据"
    :show-checkbox="false"
    :highlight-current="true"
    :expand-on-click-node="false"
    @node-click="handleNodeClick"
  >
    <div slot-scope="{ node, data }" class="custom-tree-node">
      <div>
        <!-- 没有子元素时显示的图标 (即是最后一层) -->
        <span v-if="!data.children || !data.children.length">
          <i class="el-icon-document" style="color: #8c8c8c;" />
        </span>
        <!-- 有子元素显示的图标 -->
        <span v-else @click.stop="openBtn(data)">
          <!-- 这里的展开的显示隐藏即是 [+] [-]-->
          <svg-icon v-if="data.open" icon-class="add-s" style="font-size: 18px" />
          <svg-icon v-else icon-class="sub-s" />
        </span>
        <!-- 名称 -->
        <span>{{ node.label }}</span>
      </div>
    </div>
  </el-tree>
</template>

<script>
export default {
  name: 'ListTree',
  props: {
    label: { type: String, required: false, default: 'label' },
    // 展示数据
    list: { type: Array, required: true, default: () => [] },
    // 当前选中哪项
    currKey: { type: [String, Number], required: false },
    // 点击某项的回调函数
    clickFun: { type: Function, required: true, default: () => {} }
  },
  watch: {
    currKey(val) {
      this.$nextTick(() => {
        (val != null) && this.$refs.tree.setCurrentKey(val);
      });
    }
  },
  methods: {
    openBtn(data) {
      data.open = !data.open;
      this.$refs.tree.store.nodesMap[data.id].expanded = !data.open;
    },
    // 左侧树节点点击事件
    handleNodeClick(data, node) {
      // 从当前节点一直往上一层次找，data每一层的data
      const dataList = [data]; // 包括当前节点
      const handleParent = parent => {
        // 为空或者‘顶级菜单’就不用添加进来了
        if (!parent.data.id || parent.data.id === '0') return;
        dataList.unshift({ ...parent.data, children: null });
        if (parent.parent) handleParent(parent.parent);
      };
      handleParent(node.parent);
      console.log('handleNodeClick dataList', dataList);
      // 回调函数
      this.clickFun({ data, dataList });
    }
  }
};
</script>

<style lang='scss' scoped></style>
