<template>
  <div>
    <!-- 抽屉关闭，显示有哪些抽屉把手按钮 -->
    <div v-show="!currentDrawer" :class="{'open-btn': true, 'hidden': !!currentDrawer}">
      <div v-for="item in drawers" :key="item.name">
        <!-- 按钮的icon统一使用svg-icon -->
        <el-button
          v-if="item.isShow"
          class="handle-button" type="primary"
          @click="openDrawer(item)"
        ><svg-icon :icon-class="item.icon" class="custom-icon" /></el-button>
      </div>
    </div>
    <!-- 抽屉打开，显示抽屉里的具体内容 -->
    <el-drawer
      :visible="!!currentDrawer"
      direction="rtl"
      :with-header="false"
      :show-close="false"
      :size="size"
      :wrapper-closable="false"
    >
      <!-- 关闭按钮 -->
      <div class="close-btn">
        <!-- 关闭的处理下放到具体组件内部 -->
        <el-button type="primary" class="handle-button" icon="el-icon-close" @click="closeDrawer" />
      </div>
      <!-- 当currentDrawer改变时切换到它对应的抽屉（组件），将抽屉信息对象里的入参传递到具体组件内部 -->
      <keep-alive><component :is="currentDrawer" ref="content" :params="params" /></keep-alive>
    </el-drawer>
  </div>
</template>

<script>
import Settings from '../Settings/index.vue';
import DebugScene from '@/views/load-manager/scene-manager/SaveScene/components/DebugScene.vue';
import JmeterLog from '@/views/load-manager/scene-manager/Scene/components/JmeterLog.vue';
export default {
  name: 'RightPanel',
  components: {
    Settings,
    DebugScene,
    JmeterLog
  },
  data() {
    return {
      size: '30%'
    };
  },
  computed: {
    // 所有的抽屉
    drawers() {
      // 所有的抽屉，是个Object
      return this.$store.state.rightPanel.drawers;
    },
    // 当前抽屉名
    currentDrawer() {
      // 当前打开的抽屉，每次只打开一个（只在页面上显示一个抽屉），是个String
      return this.$store.state.rightPanel.currentDrawer;
    },
    // 当前抽屉信息对象
    params() {
      return this.currentDrawer ? this.drawers[this.currentDrawer].params : null;
    },
    // 是否显示设置
    showSettings() {
      return this.$store.state.settings.showSettings;
    }
  },
  watch: {
    // 当切换抽屉时，需要拿取最新抽屉的size（每个抽屉展示的大小可能不一样）
    currentDrawer(val) {
      // val为空时size不变（防止关闭时突然闪一下），有值的话就取当前抽屉对象里的size
      this.size = val ? this.drawers[val].size : this.size;
    }
  },
  created() {
    // 如果系统需要展示“设置”，那么向Vuex里的drawers添加新抽屉
    if (this.showSettings) {
      // 告诉vuex添加这个抽屉，并在页面添加这个抽屉的“把手”按钮，点击这个“把手”就会打开“设置”抽屉
      this.$store.dispatch('rightPanel/setDrawer', {
        name: 'Settings', // 抽屉名，也是它对应组件的名称
        size: '20%', // 抽屉组件的宽度大小
        isShow: true, // 是否在页面右侧显示抽屉把手按钮，像设置是常驻显示的，场景执行日志就无需显示把手按钮
        icon: 'setting' // 抽屉把手的显示图标
      });
    }
  },
  methods: {
    // 通知vuex修改currentDrawer，然后本组件会监听到currentDrawer修改，会打开抽屉并显示对应的组件
    openDrawer({ name }) {
      this.$store.dispatch('rightPanel/changeCurrentDrawer', name);
    },
    // 关闭的处理下放到具体组件内部
    closeDrawer() {
      this.$refs.content.$emit('close');
    }
  }
};
</script>

<style lang='scss' scoped>
::v-deep {
  .el-drawer {
    overflow: unset;
  }
  /* 抽屉隐藏，抽屉组件滑出去 */
  .el-drawer.rtl {
    animation: 0.3s linear 0.1ms 1 normal both running rtl-drawer-out;
  }
  /* 抽屉展示，抽屉组件滑进入 */
  .el-drawer__open .el-drawer.rtl {
    animation: 0.3s linear 0.1ms 1 normal both running rtl-drawer-in;
  }
  @keyframes rtl-drawer-in {
    0% { transform: translate(100%, 0px); }
    100% { transform: translate(0px, 0px); }
  }
  @keyframes rtl-drawer-out {
    0% { transform: translate(0px, 0px); }
    100% { transform: translate(100%, 0px); }
  }
}
.handle-button {
  box-sizing: border-box;
  width: 40px;
  height: 40px;
  font-size: 28px;
  padding: 2px;
}
.open-btn, .close-btn {
  width: 40px;
}
.open-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: fixed;
  right: 0;
  top: 40%;
  z-index: 2001;
  /* 把手展示，把手组件滑进入，延迟0.3s是为了等抽屉组件滑出去 */
  animation: 0.4s linear 0.3s 1 normal both running rtl-drawer-btn-in;
  @keyframes rtl-drawer-btn-in {
    0% { transform: translate(100%, 0px); }
    100% { transform: translate(0px, 0px); }
  }
  .handle-button {
    margin: 2px 0;
  }
}
.open-btn.hidden {
  /* 把手隐藏，把手组件滑出去 */
  animation: 0.1s linear 0.1ms 1 normal both running rtl-drawer-btn-out;
  @keyframes rtl-drawer-btn-out {
    0% { transform: translate(0px, 0px); }
    100% { transform: translate(100%, 0px); }
  }
}
.close-btn {
  position: absolute;
  left: -40px;
  top: 40%;
}
</style>
