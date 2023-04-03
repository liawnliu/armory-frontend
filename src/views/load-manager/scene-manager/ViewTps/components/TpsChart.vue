<template>
  <div :style="{width:width}">
    <div ref="tpsChart" :style="{height:height,width:width,margin:'20px 0'}" />
    <div ref="avgTimeChart" :style="{height:height,width:width,margin:'20px 0'}" />
    <div ref="connChart" :style="{height:height,width:width,margin:'20px 0'}" />
  </div>
</template>

<script>
import * as echarts from 'echarts/core';
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  DataZoomComponent
} from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
echarts.use([
  TitleComponent, ToolboxComponent, TooltipComponent, GridComponent, LegendComponent, LineChart,
  CanvasRenderer, UniversalTransition, DataZoomComponent]);
import { tpsChartInitData, avgTimeChartData, connChartData } from '../scripts/handle-data.js';
import resize from '../mixin/resize.js';
export default {
  name: 'TpsChart',
  mixins: [resize],
  props: {
    chartData: {
      type: [Object, Array],
      required: false,
      // 特地设置为null，区分延迟渲染和立即渲染。延迟渲染时，chartData早就有值了，而立即渲染chartData还是null。
      default: null
    },
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '400px'
    }
  },
  data() {
    return {
      tpsChart: null, // tps实时数据图表
      tpsChartData: null,
      avgTimeChart: null, // 响应时间图表
      avgTimeChartData: null,
      connChart: null, // 并发数图表
      connChartData: null
    };
  },
  watch: {
    chartData(value) {
      console.log('tpsChart watch chartData', value);
      this.receiveData(value); // 一般情况，非延迟渲染，那么就是先渲染一个空架子，后再接收新数据再重新渲染
    }
  },
  mounted() {
    this.initChart(); // 生成chart实例，以及基础的chart设置option
    this.receiveData(this.chartData); // 因为有延迟渲染的场景，那么就有挂载后接收数据情况；一般场景就是侦听chartData
  },
  beforeDestroy() {
    this.tpsChart && this.tpsChart.dispose(); // 销毁chart
    this.tpsChart = null;
    this.avgTimeChart && this.avgTimeChart.dispose();
    this.avgTimeChart = null;
    this.connChart && this.connChart.dispose();
    this.connChart = null;
  },
  methods: {
    // 将chart挂到dom上并设置最最基础的option
    initChart() {
      this.tpsChart = echarts.init(this.$refs.tpsChart);
      this.avgTimeChart = echarts.init(this.$refs.avgTimeChart);
      this.connChart = echarts.init(this.$refs.connChart);
      this.setOptions();
    },
    // 最最基础的option
    setOptions() {
      // tpsChart
      this.tpsChartData = tpsChartInitData();
      this.tpsChart.setOption(this.tpsChartData);
      // avgTimeChart
      this.avgTimeChartData = avgTimeChartData();
      this.avgTimeChart.setOption(this.avgTimeChartData);
      // connChart
      this.connChartData = connChartData();
      this.connChart.setOption(this.connChartData);
    },
    receiveData(params) {
      console.log('receiveData params', params);
      if (params == null) return;
      // 数组（多条数据）
      if (params instanceof Array) {
        params.forEach(item => {
          const data = JSON.parse(item);
          this.updateOptions(data); // 追加数据，更新option
        });
        return;
      }
      // 单条数据
      this.updateOptions(params); // 追加数据，更新option
    },
    // 更新option
    updateOptions({ createDate, tps, error, avgRt, concurrentNum }) {
      // tpsChart
      this.tpsChartData.xAxis.data.push(createDate); // x轴新数据追加
      this.tpsChartData.series[0].data.push(tps); // y轴新数据追加
      this.tpsChartData.series[1].data.push(error); // y轴新数据追加
      this.tpsChart.setOption(this.tpsChartData); // 更新chart
      // avgTimeChart
      this.avgTimeChartData.xAxis.data.push(createDate);
      this.avgTimeChartData.series[0].data.push(avgRt);
      this.avgTimeChart.setOption(this.avgTimeChartData);
      // connChart
      this.connChartData.xAxis.data.push(createDate);
      this.connChartData.series[0].data.push(concurrentNum);
      this.connChart.setOption(this.connChartData);
    }
  }
};
</script>
