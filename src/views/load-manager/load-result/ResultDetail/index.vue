<template>
  <CommTemplate>
    <div>
      <div><span class="basic-label">场景名</span><span class="basic-msg">{{ basicInfo.sceneName }}</span></div>
      <div><span class="basic-label">执行时间</span><span class="basic-msg">{{ basicInfo.createTime }}</span></div>
      <div><span class="basic-label">版本号</span><span class="basic-msg">{{ basicInfo.version }}</span></div>
      <div><span class="basic-label">总TPS</span><span class="basic-msg">{{ basicInfo.totalTps }}</span></div>
      <div class="handleArea">
        <el-button
          v-btn-auth="['load:resultDetail:addToReport']"
          type="primary"
          @click="updateFlag(1)"
        >添加到报表</el-button>
        <el-button
          v-btn-auth="['load:resultDetail:deleteFromReport']"
          type="danger"
          @click="updateFlag(0)"
        >从报表中删除</el-button>
      </div>
      <el-tabs
        v-model="activeName" type="card"
        style="width:100%"
        @tab-click="activeName === 'detailInfo' ? 'executeChart' : 'detailInfo'"
      >
        <el-tab-pane label="详细数据" name="detailInfo"><ResultDetailTable :result-detail="resultDetail" /></el-tab-pane>
        <el-tab-pane label="测试图表" name="executeChart" :lazy="true">
          <TpsChart :chart-data="chartData" />
        </el-tab-pane>
      </el-tabs>
      <!-- 在 el-tab-pane 里使用 echart 会有一个问题，chart如果不是第一个显示的而是需要切换才显示，那么它的图形不被挤压变形 -->
      <!-- 那为什么其他的情况九不会变形呢？原因一，el-tabs使用了display:none来实现切换，就导致其他页签的width暂时为0； -->
      <!-- 原因二，chart本身的重排重绘需要手动调用resize()，而其他html元素是自动重排重绘的。 -->
      <!-- 解决办法一，延迟渲染，切换到自己这个tab时才渲染chart，也就是父节点去掉display:none获取width后就可以渲染了 -->
      <!-- 当然，这只是第一次，再次切换就会有keep-alive缓存。解决办法二，第一次切换到chart所在tab就手动chart.resize() -->
      <!-- 选择办法一，因为办法二在chart面积大内容多时，会有一个非常明显的过渡画面，也就是“变形”到“正常”的这一过程 -->
      <!-- 其实还有一种解决方案，就是动态计算chart所需width，然后传递过去，但它依赖外层很多元素，嵌套层次一变就要修改代码 -->
    </div>
  </CommTemplate>
</template>

<script>
import CommTemplate from '@/views/common/CommTemplate.vue';
import { getResultDetailById, getRealTimeResultData, updateFlagToTable } from '@/api/load-manager';
import ResultDetailTable from './ResultDetailTable.vue';
import TpsChart from '@/views/load-manager/scene-manager/ViewTps/components/TpsChart.vue';
import { handleStandard } from '@/utils/handle-standard';
export default {
  name: 'ResultDetail',
  components: { CommTemplate, ResultDetailTable, TpsChart },
  data() {
    return {
      basicInfo: {
        sceneName: '',
        createTime: '',
        version: '',
        totalTps: 0
      },
      resultDetail: [],
      activeName: 'detailInfo',
      chartData: null
    };
  },
  computed: {
    resultData() {
      return {
        resultId: this.$route.query.resultId,
        sceneId: this.$route.query.sceneId,
        taskId: this.$route.query.taskId,
        conn: this.$route.query.conn,
        tps: this.$route.query.tps
      };
    }
  },
  created() {
    this.getResultDetailById();
    this.getRealTimeResultData();
  },
  methods: {
    async getResultDetailById() {
      try {
        const { content } = await getResultDetailById({ id: this.resultData.resultId });
        if (content == null || !content.length) return;
        handleStandard(content);
        // 基本信息
        this.basicInfo.sceneName = `${content[0].sceneName || ''}-${this.resultData.conn}并发`;
        this.basicInfo.createTime = content[0].createTime || '';
        this.basicInfo.version = content[0].version || '';
        this.basicInfo.totalTps = this.resultData.tps;
        // 详细信息 表格
        this.resultDetail = content;
      } catch (error) {
        this.$message({ type: 'error', message: error.message });
      }
    },
    // echarts图表数据
    async getRealTimeResultData() {
      try {
        const { content } = await getRealTimeResultData({ sceneResultId: this.resultData.resultId });
        if (content == null || !content.length) return;
        this.$nextTick(() => {
          this.chartData = content;
        });
      } catch (error) {
        this.$message({ type: 'error', message: error.message });
      }
    },
    // 添加/删除到报表
    async updateFlag(resultFlag) {
      try {
        if (!this.resultDetail || !this.resultDetail.length) {
          this.$message({ type: 'error', message: '当前无结果列表不能设置' });
          return;
        }
        await updateFlagToTable({ id: this.resultData.resultId, resultFlag });
        this.$message({ type: 'success', message: '设置成功' });
      } catch (error) {
        this.$message({ type: 'error', message: error.message });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.basic-label {
  position: relative;
  display: inline-block;
  width: 80px;
  margin: 10px 15px;
  font-size: 15px;
  font-weight: 600;
  text-align: right;
  &::after{
    content: '：';
    position: absolute;
    right: -15px;
  }
}
.basic-msg {
  display: inline-block;
  width: 200px;
  margin: 10px 0;
  font-size: 15px;
}
.handleArea {
  display: flex;
  justify-content:flex-end;
}
</style>
