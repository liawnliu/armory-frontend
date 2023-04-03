<template>
  <div class="navbar">
    <!-- 隐藏or展示左侧菜单栏的按钮 -->
    <hamburger
      :is-active="sidebar.opened"
      class="hamburger-container"
      @toggleClick="toggleSideBar"
    />
    <!-- 面包屑 -->
    <breadcrumb class="breadcrumb-container" />
    <!-- 导航栏右侧的一些小菜单按钮 -->
    <div class="right-menu">
      <template v-if="device !== 'mobile'">
        <screenfull id="screenfull" class="right-menu-item hover-effect" />
        <size-select id="size-select" title="Global Size" class="right-menu-item hover-effect" />
      </template>
      <!-- 下拉栏。trigger="click"表示点击才触发下拉栏 -->
      <el-dropdown class="avatar-container" trigger="click">
        <!-- 右上角头像展示区域 -->
        <div class="avatar-wrapper">
          <img :src="avatar + '?imageView2/1/w/80/h/80'" class="user-avatar">
          <!-- 头像旁边的三角形 -->
          <i class="el-icon-caret-bottom" />
        </div>
        <!-- 下拉栏菜单打开时的menu -->
        <el-dropdown-menu slot="dropdown" class="user-dropdown">
          <!-- 第一项，回到首页 -->
          <router-link to="/">
            <el-dropdown-item> Home </el-dropdown-item>
          </router-link>
          <!-- 第二项，修改 -->
          <el-dropdown-item divided @click.native="changePassword">
            <!-- .native事件修饰符是为了在父组件里给子组件绑定原生事件 -->
            <span style="display: block">修改密码</span>
          </el-dropdown-item>
          <!-- 第三项，登出系统（注销） -->
          <el-dropdown-item divided @click.native="logout">
            <span style="display: block">注销</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Breadcrumb from '@/components/Breadcrumb';
import Hamburger from '@/components/Hamburger';
import Screenfull from '@/components/Screenfull';
import SizeSelect from '@/components/SizeSelect';

export default {
  components: {
    Breadcrumb,
    Hamburger,
    Screenfull,
    SizeSelect
  },
  computed: {
    ...mapGetters(['sidebar', 'avatar', 'device'])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar');
    },
    async logout() {
      try {
        await this.$confirm('确定退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        await this.$store.dispatch('user/logout');
      } catch (error) {
        if (error === 'cancel') return;
        console.warn('Navbar error', error);
        this.$message({ type: 'error', message: error.message });
      } finally {
        this.$router.push(`/login?redirect=${this.$route.fullPath}`);
      }
    },
    changePassword() {}
  }
};
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #ededed;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 30px;
      margin-left: 5px;
      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
