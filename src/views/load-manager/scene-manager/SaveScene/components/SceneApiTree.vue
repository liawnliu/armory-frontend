<template>
  <el-tree
    ref="tree"
    :data="apiList"
    node-key="id"
    :props="{children: 'children',label: 'label'}"
    :default-expand-all="false"
    empty-text="暂无数据"
    :show-checkbox="false"
    :highlight-current="true"
    :expand-on-click-node="false"
    draggable
    :allow-drag="allowDrag"
    :allow-drop="allowDrop"
    @node-drop="dropFinish"
    @node-click="handleNodeClick"
    @node-expand="nodeExpand"
    @node-collapse="nodeCollapse"
    @current-change="currentChange"
  >
    <div slot-scope="{ node, data }" class="custom-tree-node">
      <div class="item-show">
        <svg-icon :icon-class="getIcon(data.showType)" class="custom-icon" style="margin-right: 5px" />
        <div v-if="data.showType===2" class="link-around">{{ node.label }}</div>
        <span v-else :title="node.label" class="item-label">{{ node.label }}</span>
      </div>
      <div :class="`item-handle show-type${data.showType}`">
        <el-button
          v-if="data.showType===0&&data.children&&data.children.length" type="primary"
          title="调试整个场景" @click="debugScene"
        >
          <svg-icon icon-class="debug" class="custom-icon" />
        </el-button>
        <el-button
          v-if="data.showType===0" type="primary"
          icon="el-icon-plus"
          title="为场景新增接口/链路" @click="addItem(data)"
        />
        <el-button
          v-if="data.showType===2" type="primary"
          icon="el-icon-plus"
          title="为链路新增单接口" @click="addItem(data)"
        />
        <el-button
          type="danger"
          icon="el-icon-delete"
          :title="getDeleteTitle(data.showType)" @click="deleteItem(data, node)"
        />
      </div>
    </div>
  </el-tree>
</template>

<script>
import { selectProjectDialogEvent } from '@/config/event';
import { handleDropFinish, addApiToTree, updateOrderFlag, handleSceneId } from '../scripts/handle-data';
export default {
  name: 'SceneApiTree',
  props: {
    // 展示数据，切记这个apiList和父级index.vue中的apiList是指向同一个对象，并没有做变量隔离，所以this.saveFun()时不用传apiList
    apiList: { type: Array, required: true, default: () => [] },
    maxLink: { type: Number, required: true, default: 0 },
    clickFun: { type: Function, required: true, default: () => {} },
    saveFun: { type: Function, required: true, default: () => {} }
  },
  data() {
    return {
      currentKey: '',
      expandedArr: []
    };
  },
  watch: {
    apiList: {
      handler(val) {
        const root = val[0];
        // 有接口/链路才展示调试功能
        if (root && root.children && root.children.length) {
          // 更新vuex中的抽屉
          this.$store.dispatch('rightPanel/setDrawer', {
            name: 'DebugScene', // 抽屉名，也是它对应组件的名称
            size: '60%', // 抽屉组件的宽度大小
            isShow: true, // 是否在页面右侧显示抽屉把手按钮，像设置是常驻显示的，场景执行日志就无需显示把手按钮
            icon: 'debug', // 抽屉把手的显示图标
            params: { ...root, id: handleSceneId(root.id, 1) } // 个性化传参——场景
          });
        }
        // 涉及到操作refs，所以用nextTick
        this.$nextTick(() => {
          const id = root.id;
          // 展开最顶层的
          val.length && (this.$refs.tree.store.nodesMap[id].expanded = true);
          // 保持树的展开状态
          if (this.expandedArr.length) {
            this.expandedArr.forEach(item => {
              this.$refs.tree.store.nodesMap[item].expanded = true;
            });
          }
          // 保持树的选中状态
          if (!this.currentKey) {
            this.$refs.tree.setCurrentKey(id);
            this.currentKey = id;
          } else {
            this.$refs.tree.setCurrentKey(this.currentKey);
          }
        });
      }
    }
  },
  activated() {
    // 显示调试抽屉的把手
    this.$store.dispatch('rightPanel/switchDrawerBtn', { name: 'DebugScene', status: true });
  },
  deactivated() {
    // 隐藏调试抽屉的把手
    this.$store.dispatch('rightPanel/switchDrawerBtn', { name: 'DebugScene', status: false });
  },
  beforeDestroy() {
    console.log('SceneApiTree beforeDestroy');
    this.$store.dispatch('rightPanel/deleteDrawer', 'DebugScene');
  },
  methods: {
    getDeleteTitle(showType) {
      let title = '';
      switch (showType) {
      case 0:
        title = '删除场景下所有接口/链路';
        break;
      case 1:
        title = '删除单接口';
        break;
      case 2:
        title = '删除链路';
      }
      return title;
    },
    getIcon(showType) {
      let icon = '';
      switch (showType) {
      case 0:
        icon = 'scene';
        break;
      case 1:
        icon = 'api';
        break;
      case 2:
        icon = 'apilink';
      }
      return icon;
    },
    // return false表示不允许xxx节点进行拖拽
    allowDrag(draggingNode) {
      // root不允许拖拽
      if (draggingNode.data.showType === 0) return false;
      return true;
    },
    // return false表示不允许落在xxx，一定要注意type有三个值prev、inner、next而不是before、inner、after
    allowDrop(draggingNode, dropNode, type) {
      // console.log('allowDrop draggingNode', draggingNode);
      // console.log('allowDrop dropNode', dropNode);
      // 不能落在“单接口”的内部
      if (dropNode.data.groupFlag == null && type === 'inner') {
        return false;
      }
      // 链路不能落在链路内部
      if (draggingNode.data.groupFlag != null && dropNode.data.groupFlag != null && type === 'inner') {
        return false;
      }
      return true;
    },
    // dropFinish拖拽成功了，数据也帮你“拖拽”过去了，但是orderFlag和groupFlag需要修改
    dropFinish(draggingNode, dropNode, type) {
      console.log('dropFinish draggingNode', draggingNode);
      console.log('dropFinish dropNode', dropNode);
      console.log('dropFinish type', type);
      console.log('apiList', this.apiList);
      handleDropFinish(this.apiList);
      console.log('处理后的this.apiList', this.apiList);
      // 去保存
      this.saveFun();
    },
    // 左侧树节点点击事件
    handleNodeClick(data) {
      console.log('handleNodeClick data', data);
      this.clickFun(data);
    },
    // 节点被展开时触发
    nodeExpand(data) {
      console.log('nodeExpand data', data);
      if (!this.expandedArr.includes(data.id)) {
        this.expandedArr.push(data.id);
      }
      console.log('nodeExpand expandedArr', this.expandedArr);
    },
    // 节点被关闭时触发
    nodeCollapse(data) {
      console.log('nodeCollapse data', data);
      const index = this.expandedArr.indexOf(data.id);
      if (index !== -1) {
        this.expandedArr.splice(index, 1);
      }
      console.log('nodeCollapse expandedArr', this.expandedArr);
    },
    currentChange(data) {
      this.currentKey = data.id;
      console.log('currentChange currentKey', this.currentKey);
    },
    // 调试整个场景
    async debugScene() {
      // 打开右侧的调试抽屉
      this.$store.dispatch('rightPanel/changeCurrentDrawer', 'DebugScene');
    },
    // 先打开选择工程的弹窗，选好工程又会打开选择接口的弹窗
    addItem(parent) {
      const finishFun = ({ apiList, isLink }) => {
        // 将一维api数组放到tree里的parent.children
        addApiToTree(apiList, parent, isLink, this.maxLink);
        // 给新增的单接口加上orderFlag，并且更新整体的orderFlag
        updateOrderFlag(this.apiList);
        console.log('addItem this.apiList', this.apiList);
        // 去保存
        this.saveFun();
      };
      this.$bus.$emit(selectProjectDialogEvent, { allowLink: parent.showType === 0, finishFun });
    },
    async deleteItem(data, node) {
      console.log('deleteItem data', data);
      console.log('deleteItem node', node);

      try {
        await this.$confirm('您确定是否要删除？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        if (data.showType === 0) { // 清空场景里所有接口/链路
          this.apiList[0].children = [];
        } else {
          this.$refs.tree.remove(data);
        }
        console.log('deleteItem this.apiList', this.apiList);
        // 去保存
        this.saveFun();
      } catch (error) {
        console.log('deleteItem error', error);
      }
    }
  }
};
</script>

<style lang='scss' scoped>
@import '~@/styles/mixin.scss';
.el-tree {
  font-size: 18px;
  background-color: #efefef;
  ::v-deep {
    /* 当前选中时的颜色 */
    .el-tree-node.is-current > .el-tree-node__content {
        background-color: #b4ebc0;
    }
    /* 每一条展示高度以及悬浮时的背景颜色 */
    .el-tree-node__content {
      height: 30px;
      line-height: 30px;
      &:hover {
        background-color: #c0f1d4;
      }
      .el-tree-node__expand-icon {
        color:#b2b7bf
      }
      .el-tree-node__expand-icon.is-leaf {
        color: transparent;
      }
    }
    /* tree的顶级条目的高度以及字体大小 */
    & > .el-tree-node > .el-tree-node__content {
      height: 35px;
      font-weight: 600;
      font-size: 18px;
      line-height: 35px;
      background-color: #e0e5e2;
      .el-tree-node__expand-icon {
        font-size: 18px;
        padding: 0 5px 0 0;
      }
    }
    .custom-tree-node {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-right: 8px;
      /* 减23px的原因是 .el-tree-node__expand-icon的font-size是18px，右内边距是5px */
      width: calc(100% - 23px);
      .item-show {
        flex: 1;
        .link-around {
          display: inline-block;
          color: #fff;
          padding: 0 6px;
          font-size: 15px;
          line-height: 24px;
          background-color: #1890ff;
          border-radius: 3px;
        }
        /* 文字过长会截取成三个点 */
        @include hiddenText
      }
      /* 接口或链路的按钮只在悬浮时展示 */
      .item-handle {
        display: none;
        flex-grow: 0;
        flex-shrink: 0;
        .el-button {
          padding: 4px 6px;
        }
      }
      /* 接口或链路的按钮只在悬浮时展示 */
      &:hover {
        .item-handle {
          display: block;
        }
      }
      /* 场景的按钮一直显示 */
      .show-type0.item-handle {
        width: 100px;
        display: block;
      }
      .show-type1.item-handle {
        width: 33px;
      }
      .show-type2.item-handle {
        width: 66px;
      }
    }
  }
}
</style>
