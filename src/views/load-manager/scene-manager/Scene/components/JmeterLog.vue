<template>
  <div class="log-centent">
    <div class="log-title"><span>{{ `【${params.sceneName}】运行日志` }}</span></div>
    <div ref="logScroll" class="log-scroll" :style="{height: getScrollHeight()}" @scroll="handleScroll">
      <p><b>日志详情：</b></p>
      <div v-html="result" />
    </div>
  </div>
</template>

<script>
import { getJmeterLog } from '@/api/load-manager';
import { setInterval, clearInterval } from 'timers';
export default {
  name: 'JmeterLog',
  props: {
    params: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  data() {
    return {
      lastScrollHeight: 0, // 面板增长前的高度
      lastScrollTop: 0, // 面板增长前或者滚动条滚动前的scrollTop
      result: '暂无数据',
      timer: null
    };
  },
  computed: {
    clientHeight() {
      return (this.$refs && this.$refs.logScroll) ? this.$refs.logScroll.clientHeight : 0;
    }
  },
  mounted() {
    // 接收到右侧公共抽屉组件的“关闭通知”，无需完善这个“关闭”，直接关闭
    this.$on('close', () => {
      // 与调试日志那边不一样，这边是只要关闭了就清空timer和日志结果，下次进来重新请求
      this.clearTimer();
      this.clearResult();
      this.$store.dispatch('rightPanel/changeCurrentDrawer', '');
    });
  },
  activated() {
    // 请求Jmeter日志
    this.getJmeterLog();
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
      this.lastScrollHeight = 0;
      this.lastScrollTop = 0;
    },
    getJmeterLog() {
      this.timer = setInterval(async() => {
        try {
          // getJmeterLog第二个参数是needLoading，在timer场景下一般不需要Loading遮罩
          const { content } = await getJmeterLog({ sceneId: this.params.id }, false);
          if (content == null) return;
          this.result = content;
          this.$nextTick(() => {
            // 尽量让滚动条在最底端，这里使用$nextTick的原因是保证取得的scrollHeight是增长后最新值
            this.scrollBottom();
          });
          // scene执行完就清空timer
          if (this.params.workStatus !== 1) {
            this.clearTimer();
          }
        } catch (error) {
          console.log('error', error);
        }
      }, 2000);
    },
    handleScroll() {
      this.lastScrollTop = this.$refs.logScroll.scrollTop;
    },
    /*
        日志更新，自动将滚动条拉到最底端。当我们想查看中间部分的日志时，会手动将滚动条滚到“非最底端”，
        即使新日志来了面板也自动增长，但此时页面应该在原地保持不动（不自动拉到最底端了），方便我们继续
        查看中间部分的日志。当我们又将滚动条拉回最底端，那么就要恢复“自动将滚动条拉到最底端”的功能。
        其实很简单，只要判断上一次是否处于最底端就知道这一次要不要处于最底端：上一次不处于，那么这一次滚动条不要动，
        上一次处于，那么这一次自然也要处于最底端
    */
    scrollBottom() {
      const logScroll = this.$refs.logScroll;
      if (logScroll == null) return;
      const scrollHeight = logScroll.scrollHeight;
      const clientHeight = this.clientHeight;
      const lastScrollHeight = this.lastScrollHeight;
      const lastScrollTop = this.lastScrollTop;
      console.log('scrollHeight', scrollHeight);
      console.log('clientHeight', clientHeight);
      console.log('lastScrollHeight', lastScrollHeight);
      console.log('scrollTop', lastScrollTop);
      // 需要滚动时才滚动，并且面板确实加长了
      if (scrollHeight >= clientHeight && lastScrollHeight !== scrollHeight) {
        // lastScrollHeight为0表示第一次，第一次自然要拉到最底端。
        if (lastScrollHeight === 0 || ((lastScrollHeight - clientHeight) === lastScrollTop)) {
          // 更新lastScrollTop，以及scroll的scrollTop
          logScroll.scrollTop = this.lastScrollTop = scrollHeight - clientHeight;
        }
        // 更新lastScrollHeight
        this.lastScrollHeight = scrollHeight;
      }
    },
    /*
      对于设置height: calc(100% - 60px - 10px);后overflow失效的问题，
      height要取固定值，用了calc和100%就不行了
    */
    getScrollHeight() {
      let winHeight;
      if (window.innerHeight) {
        winHeight = window.innerHeight;
      } else if ((document.body) && (document.body.clientHeight)) {
        winHeight = document.body.clientHeight;
      }
      return `${winHeight - 60 - 10}px`;
    }
  }
};
</script>
<style scoped lang="scss">
@import '~@/styles/mixin.scss';
.log-centent {
  height: 100%;
  .log-title {
    text-align: center;
    height: 22px;
    line-height: 22px;
    font-size: 22px;
    font-weight: 500;
    margin: 20px 0 18px 0;
  }
  .log-scroll {
    box-sizing: border-box;
    /* height: calc(100% - 60px - 10px); */
    overflow: auto;
    margin: 10px;
    padding: 10px;
    border: 1px solid #b9b9b9;
    border-radius: 5px;
    @include scrollBar;
  }
}
</style>
