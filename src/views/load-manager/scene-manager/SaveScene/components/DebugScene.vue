<template>
  <div class="debug-centent">
    <div class="debug-title"><span>{{ `调试【${params.sceneName}】` }}</span></div>
    <div class="debug-handle">
      <el-button type="primary" size="mini" @click="toDebug">
        <span v-if="!debugging">开始调试</span>
        <span v-else>调试中...</span>
      </el-button>
      <el-button type="warning" size="mini" @click="clearResult">清空结果</el-button>
      <el-button type="danger" size="mini" @click="stopDebug">停止调试</el-button>
    </div>
    <div class="debug-scroll" :style="{height: getScrollHeight()}">
      <p><b>调试结果：</b></p>
      <div v-html="result" />
    </div>
  </div>
</template>

<script>
import { sceneDebug, getDebugData, stopExecuteScene } from '@/api/load-manager';
import { setInterval, clearInterval } from 'timers';
export default {
  name: 'DebugScene',
  props: {
    params: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  data() {
    return {
      debugging: false,
      result: '暂无数据',
      timer: null
    };
  },
  mounted() {
    /*
      业务需求是：如果没有在调试那就直接关闭（有调试结果那就保留），如果正在调试就停止调试（此时没有调试结果）
      那么下一次点进来肯定是未调试状态
     */
    this.$on('close', this.closeWin);
  },
  beforeDestroy() {
    this.clearTimer();
    this.clearResult();
    this.$off(); // 一键解绑所有事件
  },
  methods: {
    clearTimer() {
      (this.timer != null) && clearInterval(this.timer);
    },
    clearResult() {
      this.result = '暂无数据';
      this.debugging = false;
    },
    // 接收到右侧公共抽屉组件的“关闭通知”，我们来完善这个“关闭”
    async closeWin() {
      try {
        if (this.debugging) {
          await this.$confirm('您确定要关闭吗？关闭后场景将会停止调试！', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          });
          // 通知后端停止调试
          this.stopDebug(false);
          // 主要是为了重置this.debugging，而this.result此时肯定还是'暂无数据'
          this.clearResult();
        }
        // 只清空timer，不清空调试结果，下次进来还能看到上一次调试结果
        this.clearTimer();
        // 关闭抽屉
        this.$store.dispatch('rightPanel/changeCurrentDrawer', '');
      } catch (error) {
        if (error === 'cancel') return;
        this.$message({ type: 'error', message: error.message });
      }
    },
    // 点击“开始调试”按钮
    async toDebug() {
      if (this.params == null || this.params.id == null) {
        this.$message({ type: 'error', message: '调试失败！缺乏场景信息！' });
        return;
      }
      if (this.debugging) {
        this.$message({ type: 'error', message: '调试失败。原因：有场景在调试中。' });
        return;
      }
      try {
        this.clearTimer();
        this.result = '暂无数据';
        this.debugging = true;
        await sceneDebug({ sceneId: this.params.id });
        this.getDebugData();
      } catch (error) {
        this.$message({ type: 'error', message: error.message });
        // 如果发生异常就认为停止调试了
        this.clearResult();
      }
    },
    getDebugData() {
      this.timer = setInterval(async() => {
        try {
          // getDebugData第二个参数是needLoading，在timer场景下一般不需要loading遮罩
          const { content } = await getDebugData({ sceneId: this.params.id }, false);
          if (content == null) return;
          this.result = content;
          this.debugging = false;
          // 请求到数据就清空timer，因为只要有响应，它就会一口气把所有调试结果给我们，后面不会再给新的了
          this.clearTimer();
        } catch (error) {
          console.log('error', error);
        }
      }, 1000);
    },
    async stopDebug(needConfirm) {
      if (!this.debugging) {
        // this.$message({ type: 'error', message: '停止调试失败。原因：没有场景在调试中。' });
        return;
      }
      try {
        if (needConfirm) {
          await this.$confirm('您是否确定要停止调试？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          });
        }
        await stopExecuteScene({ sceneId: this.params.id });
        this.$message({ type: 'success', message: '停止调试成功!' });
        this.debugging = false;
        this.clearTimer();
      } catch (error) {
        if (error === 'cancel') return;
        this.$message({ type: 'error', message: error.message });
      }
    },
    /*
      对于设置height: calc(100% - 60px - 40px - 10px);后overflow失效的问题，
      height要取固定值，用了calc和100%就不行了
    */
    getScrollHeight() {
      let winHeight;
      if (window.innerHeight) {
        winHeight = window.innerHeight;
      } else if ((document.body) && (document.body.clientHeight)) {
        winHeight = document.body.clientHeight;
      }
      return `${winHeight - 60 - 40 - 10}px`;
    }
  }
};
</script>
<style scoped lang="scss">
@import '~@/styles/mixin.scss';
.debug-centent {
  height: 100%;
  .debug-title {
    text-align: center;
    height: 22px;
    line-height: 22px;
    font-size: 22px;
    font-weight: 500;
    margin: 20px 0 18px 0;
  }
  .debug-handle {
    display: flex;
    justify-content: flex-end;
    height: 30px;
    margin: 10px;
    .el-button {
      padding: 7px 10px;
    }
  }
  .debug-scroll {
    box-sizing: border-box;
    /* height: calc(100% - 60px - 40px - 10px); */
    overflow: auto;
    margin: 10px;
    padding: 10px;
    border: 1px solid #b9b9b9;
    border-radius: 5px;
    @include scrollBar;
  }
}
</style>
