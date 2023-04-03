<template>
  <ContentTemplate
    :handle-area="{ addBtnName: '新增场景', addBtnAuth: ['load:scene:save'], placeholder: '输入场景名称...' }"
    :pagination.sync="pagination"
    @addItem="addScene"
    @searItem="getSceneList({ keyword: $event })"
    @paginationChange="getSceneList"
  >
    <SceneTable :scene-list="sceneList" :task-id="taskId" />
    <ExecuteDialog />
  </ContentTemplate>
</template>

<script>
import ContentTemplate from '@/views/common/ContentTemplate.vue';
import { getSceneList, getSceneById } from '@/api/load-manager';
import SceneTable from './components/SceneTable.vue';
import ExecuteDialog from './components/ExecuteDialog.vue';
export default {
  name: 'LoadScene',
  components: {
    ContentTemplate,
    SceneTable,
    ExecuteDialog
  },
  props: { taskId: { type: [Number, String], required: true }},
  data() {
    return {
      // 分页信息，会通过props方式传递给ContentTemplate组件，接口每次更新也会更新这个分页信息
      pagination: { size: 10, page: 1, total: 0 },
      sceneList: [],
      timerMap: new Map()
    };
  },
  provide() {
    return {
      getSceneList: this.getSceneList
    };
  },
  created() {
    this.getSceneList(); // 向服务器请求场景列表
  },
  beforeDestroy() {
    // 切换到别的页面了就不用在监听WorkStatus
    this.clearAllTimer();
  },
  methods: {
    async getSceneList(params) {
      try {
        params = Object.assign({ keyword: '', stressId: this.taskId }, this.pagination, params || {});
        const { content } = await getSceneList(params); // 向服务器请求场景列表
        console.log('getSceneList content', content);
        if (content == null) return;
        this.pagination.total = content.total; // 更新ContentTemplate的分页信息
        this.sceneList = content.list; // 更新ApiTable需要的apiList
        this.watchWorkStatus(); // 给执行中的条目添加定时器，一直请求它最新的workStatus，直到它不是1
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    // 添加新场景
    addScene() {
      // 切换路由
      this.$router.push({ name: 'SaveScene', query: { taskId: this.taskId }});
    },
    watchWorkStatus() {
      // 先清空所有的timer（保证上次的不影响到本次的）
      this.clearAllTimer();
      // 对本次查出的sceneList，有workStatus为的1那项进行createTimer（生成定时器，放入timerMap）
      this.sceneList.forEach(item => {
        if (item.workStatus === 1) { // 执行中
          this.createTimer(item);
        }
      });
      console.log('this.timerMap', this.timerMap);
    },
    clearAllTimer() {
      // 清空所有的定时器
      this.timerMap.forEach((value, key) => {
        clearInterval(value);
      });
      // 清空所有的key-value
      this.timerMap.clear();
    },
    createTimer(scene) {
      const sceneId = scene.id;
      const timer = setInterval(async() => {
        // getSceneById的第二个参数是needLoading，在timer场景中一般不用loading遮罩
        const sceneRes = await getSceneById({ sceneId }, false);
        if (sceneRes.content.workStatus !== 1) {
          // 清空定时器
          this.timerMap.has(sceneId) && clearInterval(this.timerMap.get(sceneId));
          // 从timerMap删除该数据
          this.timerMap.delete(sceneId);
          // 让scene指向的对象与新数据融合（更新页面上的运行状态）
          Object.assign(scene, { workStatus: sceneRes.content.workStatus });
        }
      }, 2000);
      this.timerMap.set(sceneId, timer);
    }
  }
};
</script>

<style lang="scss" scoped></style>
