import { debounce } from '@/utils';
import { tpsChartResizeEvent } from '@/config/event.js';

export default {
  data() {
    return {
      $_sidebarElm: null,
      $_resizeHandler: null
    };
  },
  mounted() {
    this.$_resizeHandler = debounce(() => {
      console.log('chart resizeHandler');
      if (this.tpsChart) {
        console.log('tpsChart resizeHandler');
        this.tpsChart.resize();
      }
      if (this.avgTimeChart) {
        console.log('avgTimeChart resizeHandler');
        this.avgTimeChart.resize();
      }
      if (this.connChart) {
        console.log('connChart resizeHandler');
        this.connChart.resize();
      }
    }, 100);
    this.$_initResizeEvent();
    this.$_initSidebarResizeEvent();
    this.$on(tpsChartResizeEvent, this.$_resizeHandler);
  },
  beforeDestroy() {
    this.$_destroyResizeEvent();
    this.$_destroySidebarResizeEvent();
    this.$off(tpsChartResizeEvent);
  },
  // to fixed bug when cached by keep-alive
  // https://github.com/PanJiaChen/vue-element-admin/issues/2116
  activated() {
    console.log('resize activated');
    this.$_initResizeEvent();
    this.$_initSidebarResizeEvent();
  },
  deactivated() {
    console.log('resize deactivated');
    this.$_destroyResizeEvent();
    this.$_destroySidebarResizeEvent();
  },
  methods: {
    // use $_ for mixins properties
    // https://vuejs.org/v2/style-guide/index.html#Private-property-names-essential
    $_initResizeEvent() {
      window.addEventListener('resize', this.$_resizeHandler);
    },
    $_destroyResizeEvent() {
      window.removeEventListener('resize', this.$_resizeHandler);
    },
    $_sidebarResizeHandler(e) {
      if (e.propertyName === 'width') {
        this.$_resizeHandler();
      }
    },
    $_initSidebarResizeEvent() {
      this.$_sidebarElm = document.getElementsByClassName('sidebar-container')[0];
      this.$_sidebarElm && this.$_sidebarElm.addEventListener('transitionend', this.$_sidebarResizeHandler);
    },
    $_destroySidebarResizeEvent() {
      this.$_sidebarElm && this.$_sidebarElm.removeEventListener('transitionend', this.$_sidebarResizeHandler);
    }
  }
};
