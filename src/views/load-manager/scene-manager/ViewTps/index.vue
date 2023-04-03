<template>
  <TpsChart :chart-data="chartData" />
</template>

<script>
import { getToken } from '@/utils/auth';
import TpsChart from './components/TpsChart.vue';
export default {
  name: 'ViewTps',
  components: { TpsChart },
  data() {
    return {
      socket: null,
      token: getToken(),
      host: '192.168.0.166:8081', // '139.224.248.233:9090'  '192.168.0.166:8081'
      chartData: null // 置为null而不是{}，否则chart横轴上会有undefined
    };
  },
  created() {
    this.initWebSocket();
  },
  beforeDestroy() {
    this.socket.close();
  },
  methods: {
    initWebSocket() {
      const url = `ws://${this.host}/data/${this.$route.query.sceneId}?token=${this.token}`;
      console.log('initWebSocket url', url);
      this.socket = new WebSocket(url);
      this.socket.onopen = () => {
        console.log('websocket链接已建立');
      };
      this.socket.onclose = () => {
        console.log('websocket链接已关闭');
      };
      this.socket.onerror = error => {
        console.warn('websocket发生了错误：', error);
      };
      this.socket.onmessage = msg => {
        console.warn('websocket接收到信息：', msg);
        if (!msg || !msg.data) return;
        this.$nextTick(() => {
          this.chartData = JSON.parse(msg.data);
        });
      };
    }
  }
};
</script>

<style lang="scss" scoped></style>
