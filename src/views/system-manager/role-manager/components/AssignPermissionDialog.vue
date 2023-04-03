<template>
  <el-dialog
    :visible.sync="dialogVisible" :title="title"
    width="400px" top="10px"
    :close-on-click-modal="false"
    @close="dialogClose"
  >
    <el-scrollbar style="height: 450px">
      <!-- check-strictly表示父子不互相关联，default-expand-all表示默认全部展开 -->
      <!-- 要使用check-strictly的原因：如果去掉check-strictly，那么父子节点是关联的，它的UI效果是checkbox的indeterminate状态 -->
      <!-- https://element.eleme.io/2.13/#/zh-CN/component/checkbox#indeterminate-zhuang-tai。简单描述就是子孙全选了， -->
      <!-- 它本身的checkbox就勾上；子孙全不选，它本身的checkbox不勾上；某些子孙选了某些子孙没选，它本身的checkbox半勾选。 -->
      <!-- 你会发现它本身的checkbox勾不勾完全取决于子孙，咋一看没毛病啊。问题就在于，我只想勾它本身，子孙都不选，例如 -->
      <!-- 我们只有权限访问“工程管理”但又不能访问“接口管理”并且也不能新增/修改/删除工程时，那应该只勾上“工程管理”即可。 -->
      <el-tree
        ref="tree"
        :data="menuList"
        show-checkbox
        check-strictly
        node-key="id"
        default-expand-all
        :props="{ label: 'label', children: 'children' }"
        :expand-on-click-node="false"
        @node-click="nodeClick"
        @check="nodeClick"
      >
        <span slot-scope="{ node, data }" class="custom-tree-node">
          <svg-icon :icon-class="data.type && data.type === 2 ? 'file' : 'folder'" class="custom-icon" />
          <span>{{ node.label }}</span>
        </span>
      </el-tree>
    </el-scrollbar>
    <div style="text-align: right; margin: 20px 10px 10px 10px">
      <el-button type="primary" @click="roleAssignSave">保存</el-button>
      <el-button type="danger" @click="dialogVisible = false">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { assignPermissionDialogEvent } from '@/config/event.js';
import { getAssignTree, roleAssignSave } from '@/api/system-manager';
import { handleMenuList } from '../scripts/handle-data';
export default {
  name: 'AssignPermissionDialog',
  data() {
    return {
      role: { id: null, name: '' },
      menuList: [],
      checkList: [],
      dialogVisible: false
    };
  },
  computed: {
    title() {
      return `为【${this.role.name}】分配权限`;
    }
  },
  watch: {
    checkList: {
      // 数据变化，让页面上的checkBox跟随变化
      handler(newVal) {
        this.$nextTick(() => {
          this.$refs.tree.setCheckedKeys(newVal);
        });
      }
    }
  },
  mounted() {
    this.$bus.$on(assignPermissionDialogEvent, this.showOrHide);
  },
  beforeDestroy() {
    this.$bus.$off(assignPermissionDialogEvent);
  },
  methods: {
    dialogClose() {
      this.dialogVisible = false;
      // 清理menuList的parentNode
      const handleList = list => {
        list.forEach(item => {
          item.parentNode = null; // 移除父节点，避免循环引用
          if (item.children && item.children.length) {
            handleList(item.children, item);
          }
          item = null;
        });
      };
      handleList(this.menuList);
      this.menuList = [];
      this.checkList = [];
    },
    showOrHide({ role }) {
      this.dialogVisible = true;
      role != null && (this.role = { ...this.role, ...role });
      this.getAssignTree();
    },
    async getAssignTree() {
      try {
        const { content } = await getAssignTree({ roleId: this.role.id, userId: this.$store.getters.user.id });
        if (content == null) return;
        this.menuList = handleMenuList(content.listmenu);
        this.checkList = content.checkList;
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    /*
      因为用了check-strictly，所以我们用nodeClick处理全选和全不选的问题
      currNodeData该节点对应的数据
    */
    nodeClick(currNodeData) {
      console.log('currNodeData', currNodeData);
      console.log('this.checkList', this.checkList);
      // 一、处理祖先节点：一个节点被勾选了，那从该节点到根节点这条路上的节点都应该被勾选
      const handleParent = data => {
        // 之前是否被勾选
        const index = this.checkList.indexOf(data.id);
        // 如果没有被勾选，那就将当前节点放入checkList（置为勾选）
        index === -1 && this.checkList.push(data.id);
        // 依次检查它的祖先节点（一直到根节点），让该节点到根节点这条路上的节点都勾选上
        if (data.parentId != null && data.parentNode != null) {
          handleParent(data.parentNode);
        }
      };
      // 二、处理后代节点：全部勾选或全部不勾选
      const handleChild = (data, status) => {
        const index = this.checkList.indexOf(data.id);
        // status为true，将子孙全部勾选
        if (status) {
          // 不存在，就放入checkList
          index === -1 && this.checkList.push(data.id);
        } else { // status为false，将子孙全部不勾选
          // 存在就从checkList里移除
          index !== -1 && this.checkList.splice(index, 1);
        }
        // 继续处理后代
        if (data.children && data.children.length) {
          data.children.forEach(item => {
            handleChild(item, status);
          });
        }
      };
      // 该节点目前勾选状态
      if (this.checkList.indexOf(currNodeData.id) === -1) { // 之前是未勾选，现在要它勾选
        // 一个节点被勾选了，那从该节点到根节点这条路上的节点都应该被勾选
        handleParent(currNodeData);
        // 顺带将它的子孙全部勾选
        handleChild(currNodeData, true);
      } else { // 之前是勾选，现在要取消勾选
        // 一个节点被取消勾选了，那么它的子孙节点全部被取消勾选
        handleChild(currNodeData, false);
      }
    },
    async roleAssignSave() {
      try {
        await roleAssignSave({ roleId: this.role.id, list: this.checkList });
        this.$message({ type: 'success', message: '权限分配成功！' });
        this.dialogVisible = false;
        // 当前登录用户拥有的角色没变，角色拥有的权限变了
        const nowUser = this.$store.getters.user;
        // 当前登录用户拥有的角色是当前在角色管理里操作的角色，其实无法具体判断哪些权限变了
        if (nowUser.roleIds.includes(this.role.id)) {
          // 更新当前登录用户的资源信息（可访问路由和左侧菜单列表）
          await this.$store.dispatch('user/updateUserAndResource', 'resource');
        }
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    }
  }
};
</script>

<style lang='scss' scoped>
::v-deep {
  .el-dialog__body{
    padding: 5px 10px;
  }
  /* 隐藏水平滚动条 */
  .el-scrollbar__wrap{
    overflow-x: hidden;
  }
}
</style>
