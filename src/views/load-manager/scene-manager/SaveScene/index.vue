<template>
  <CommTemplate :title="title">
    <el-container>
      <el-aside v-if="apiList && apiList.length" width="25%">
        <SceneApiTree
          :api-list="apiList" :max-link="maxLink"
          :click-fun="clickFun" :save-fun="saveFun"
        />
      </el-aside>
      <el-main :style="mainStyle">
        <div v-if="currentItem.showType === 0">
          <SaveSceneBasic :scene="currentItem" :update-scene-basic="updateSceneBasic" :task-id="taskId" />
        </div>
        <div v-else-if="currentItem.showType === 1">
          <SaveSceneApi :api="currentItem" :save-fun="saveFun" />
        </div>
        <div v-else>
          <ShowApiLink :api-link="currentItem" />
        </div>
      </el-main>
    </el-container>
    <!-- 链路拖拽表格的弹窗 -->
    <!-- <InterLinkDialog /> -->
    <SelectProjectDialog />
    <AddApiDialog />
  </CommTemplate>
</template>

<script>
import { Message } from 'element-ui';
import CommTemplate from '@/views/common/CommTemplate.vue';
import SaveSceneBasic from './components/SaveSceneBasic.vue';
import SaveSceneApi from './components/SaveSceneApi.vue';
import ShowApiLink from './components/ShowApiLink.vue';
import SelectProjectDialog from './components/SelectProjectDialog.vue';
import AddApiDialog from './components/AddApiDialog.vue';
import SceneApiTree from './components/SceneApiTree.vue';
import { getSceneById, getSceneApiById, saveLinkApis } from '@/api/load-manager';
import { handleSceneBasic, handleSceneApi, handleSaveLinkApisReq } from './scripts/handle-data';
export default {
  name: 'SaveScene',
  components: {
    CommTemplate,
    SceneApiTree,
    SaveSceneBasic,
    SaveSceneApi,
    ShowApiLink,
    SelectProjectDialog,
    AddApiDialog
  },
  data() {
    return {
      lastSceneId: null,
      apiList: [], // 左侧树的数据
      maxLink: 0, // 目前groupFlag最大值
      currentItem: { showType: 0 },
      apiLinkMap: new Map() // 链路容器
    };
  },
  computed: {
    sceneId() {
      return this.$route.query.sceneId;
    },
    taskId() {
      return this.$route.query.taskId;
    },
    title() {
      return this.$route.query.sceneId != null ? '编辑场景' : '新增场景';
    },
    mainStyle() {
      if (!this.apiList.length) {
        return {
          paddingRight: '15%',
          paddingLeft: '15%'
        };
      }
      return {};
    }
  },
  created() {
    this.getSceneAndApi();
    this.lastSceneId = this.sceneId;
  },
  activated() {
    console.log('activated lastSceneId', this.lastSceneId);
    console.log('activated sceneId', this.sceneId);
    // 上一次与这一次不同那得先清空再请求数据
    if (this.lastSceneId !== this.sceneId) {
      this.clearData();
      this.getSceneAndApi();
      this.lastSceneId = this.sceneId;
    }
  },
  methods: {
    // 重置数据
    clearData() {
      this.apiList = []; // 左侧树的数据
      this.maxLink = 0; // 目前groupFlag最大值
      this.currentItem = { showType: 0 };
      this.apiLinkMap = new Map(); // 链路容器
    },
    async getSceneAndApi() {
      await this.getSceneById(this.sceneId);
      await this.getSceneApiById(this.sceneId);
    },
    // 获取场景基本信息以及场景下面的接口/链路
    async getSceneById(id) {
      console.log('getSceneById id', id);
      if (id == null) return;
      try {
        // 向服务器获取场景基本信息
        const { content } = await getSceneById({ sceneId: id });
        console.log('getSceneById content', content);
        handleSceneBasic(this.apiList, content); // 交给el-tree使用
        this.currentItem = { ...this.apiList[0], children: null }; // 最初默认展示场景基本信息，也就是root
      } catch (error) {
        console.warn('getSceneById error', error);
        this.$message({ type: 'error', message: error.message });
      }
    },
    // 获取场景下面的接口/链路
    async getSceneApiById(id) {
      console.log('getSceneApiById id', id);
      if (id == null) return;
      try {
        // 向服务器获取场景关联的接口
        const { content } = await getSceneApiById({ sceneId: id });
        console.log('getSceneApiById content', content);
        // 将普通接口以及链路的假数据（只用于前端展示）放到this.apiList
        this.maxLink = handleSceneApi(this.apiList, content);
      } catch (error) {
        console.warn('getSceneApiById error', error);
        this.$message({ type: 'error', message: error.message });
      }
    },
    // 点击右侧树中某项的回调函数，主要是为了给左侧传递数据
    clickFun(data) {
      this.currentItem = data.showType === 2 ? { ...data, children: [...data.children] } : { ...data, children: null };
      console.log('clickFun this.currentItem', this.currentItem);
    },
    updateSceneBasic(sceneId) {
      // 覆盖query中的sceneId
      this.$router.replace({
        query: { ...this.$route.query, sceneId }
      });
      this.getSceneById(this.sceneId);
    },
    // 全部保存（包括拖拽、添加、删除、修改接口，都调这一个）
    async saveFun(apiForm) {
      console.log('saveFun this.apiList', this.apiList);
      console.log('saveFun apiForm', apiForm);
      try {
        const req = handleSaveLinkApisReq(this.apiList, this.sceneId, this.taskId, apiForm);
        await saveLinkApis(req);
        this.$message({ type: 'success', message: '保存成功！' });
        this.getSceneApiById(this.sceneId);
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    }
  },
  // 通过路由规则进入组件时被调用，此时组件实例还未生成
  beforeRouteEnter(to, from, next) {
    if (to.query.taskId == null) {
      // 组件实例还未生成，所以不能使用this.$message，那么就用Message
      Message.error('进入“新增/编辑场景接口”需要传递taskId！已帮你重定向到“任务管理页面”');
      next({ name: 'TaskManager' }); // 重定向到任务管理
    }
    next();
  },
  // 路由地址改变，包括浏览器地址后面的参数被去掉再回车，就会触发这个钩子
  beforeRouteUpdate(to, from, next) {
    if (to.name === 'SaveSceneApi' && to.query.taskId == null) {
      Message.error('进入“新增/编辑场景接口”需要传递taskId！已帮你重定向到“任务管理页面”');
      next({ name: 'TaskManager' }); // 重定向到任务管理
    }
    next();
  }
};
</script>

<style lang="scss" scoped>
.el-main {
  padding-top: 0
}
</style>
