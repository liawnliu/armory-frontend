
<template>
  <CommTemplate>
    <el-button
      v-btn-auth="['system:menu:save']" type="primary"
      round
      style="margin: 15px 0"
      @click="addMenu"
    >新增资源</el-button>
    <MenuTable :menu-list="menuList" />
    <MenuDialog />
    <ListTreeDialog />
  </CommTemplate>
</template>

<script>
import CommTemplate from '@/views/common/CommTemplate.vue';
import MenuTable from './components/MenuTable.vue';
import MenuDialog from './components/MenuDialog.vue';
import ListTreeDialog from '@/views/common/ListTreeDialog.vue';
import { menuDialogEvent } from '@/config/event.js';
import { getMenuList } from '@/api/system-manager';
export default {
  name: 'MenuManager',
  components: {
    CommTemplate,
    MenuTable,
    MenuDialog,
    ListTreeDialog
  },
  data() {
    return {
      // 资源列表，会通过props方式传递给MenuTable组件，接口每次更新也会更新资源列表
      menuList: []
    };
  },
  provide() {
    return {
      getMenuList: this.getMenuList
    };
  },
  created() {
    this.getMenuList(); // 向服务器请求资源列表
  },
  methods: {
    // 向服务请求部门列表
    async getMenuList() {
      try {
        const { content } = await getMenuList(); // 向服务器请求部门列表
        console.log('getMenuList data', content);
        if (content == null) return;
        this.menuList = content; // 更新MenuTable需要的menuList
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    addMenu() {
      this.$bus.$emit(menuDialogEvent, { dialogType: 'add' });
    }
  }
};
</script>
