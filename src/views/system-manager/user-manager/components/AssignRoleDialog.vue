<template>
  <el-dialog :visible.sync="dialogVisible" title="分配角色" width="50%" :close-on-click-modal="false" @close="dialogClose">
    <el-table :data="roleList" border stripe>
      <el-table-column width="50" align="center" label="选中">
        <template slot-scope="scope">
          <el-radio
            v-model="selectRoleId"
            :label="scope.row.id"
            @change="getSlectRole(scope.row)"
          >
            {{ "" }}
          </el-radio>
        </template>
      </el-table-column>
      <el-table-column label="角色名称" prop="name" />
      <el-table-column label="角色备注" prop="remark" />
    </el-table>
    <!-- 表格下方的分页  -->
    <el-pagination
      :current-page.sync="pagination.page"
      :page-size.sync="pagination.size"
      :page-sizes="[10, 20, 30, 40, 50]"
      layout="total, sizes, prev, pager, next"
      :total="pagination.total"
      @size-change="getRoleList"
      @current-change="getRoleList"
    />
    <div style="text-align: right">
      <el-button type="primary" @click="saveSelect">保存</el-button>
      <el-button type="danger" @click="dialogVisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { assignRoleDialogEvent } from '@/config/event';
import { getRoleListForAssign, getRoleIdByUserId, assingRole } from '@/api/system-manager';
import { Message } from 'element-ui';
export default {
  name: 'AssignRoleDialog',
  data() {
    return {
      dialogVisible: false,
      userId: null,
      selectRoleId: null,
      roleList: [],
      pagination: { size: 10, page: 1, total: 0 }
    };
  },
  mounted() {
    this.$bus.$on(assignRoleDialogEvent, this.showOrHide);
  },
  beforeDestroy() {
    this.$bus.$off(assignRoleDialogEvent);
  },
  methods: {
    dialogClose() {
      this.selectRoleId = null;
      this.roleList = [];
      this.pagination = { size: 10, page: 1, total: 0 };
    },
    showOrHide({ userId }) {
      console.log('showOrHide userId', userId);
      if (userId == null) {
        Message.error('分配角色需要传递userId！');
        return;
      }
      this.dialogVisible = true;
      this.userId = userId;
      this.getRoleIdByUserId({ userId });
      this.getRoleList();
    },
    async getRoleIdByUserId(params) {
      try {
        const { content } = await getRoleIdByUserId(params);
        console.log('getRoleIdByUserId content', content);
        if (content == null) return;
        this.selectRoleId = content;
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    async getRoleList() {
      try {
        const { content } = await getRoleListForAssign(this.pagination); // 向服务器请求接口列表
        console.log('getRoleList content', content);
        if (!content) return;
        this.pagination.total = content.total;
        this.roleList = content.list;
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    getSlectRole(row) {
      console.log(row);
      this.selectRoleId = row.id;
    },
    async saveSelect() {
      if (!this.selectRoleId) {
        this.$message({ type: 'warn', message: '请分配角色！' });
        return;
      }
      try {
        await assingRole({ userId: this.userId, roleId: this.selectRoleId });
        this.$message({ type: 'success', message: '分配角色成功！' });
        this.dialogVisible = false;
        // 当前登录用户拥有的角色变了
        const nowUser = this.$store.getters.user;
        if (nowUser.id === this.userId && !nowUser.roleIds.includes(this.selectRoleId)) {
          // 更新当前登录用户的信息以及资源信息（可访问路由和左侧菜单列表）
          await this.$store.dispatch('user/updateUserAndResource');
        }
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    }
  }
};
</script>

<style lang='scss' scoped></style>
