<template>
  <div>
    <el-table :data="sceneList" style="width: 100%" border stripe>
      <el-table-column align="center" label="ID" prop="id" width="100" />
      <el-table-column align="center" label="场景名称" prop="sceneName" width="220" />
      <el-table-column align="header-center" label="类型" prop="sceneTypeName" />
      <el-table-column align="header-center" label="状态">
        <template slot-scope="{ row }">
          <el-button
            :type="row.workStatusLev" :icon="getStatusIcon(row)"
          >{{ getStatusName(row) }}</el-button>
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="创建人" prop="name" />
      <el-table-column align="header-center" label="创建时间" prop="createTime" width="160" />
      <el-table-column align="header-center" label="操作" width="300">
        <template slot-scope="{ row }">
          <div class="handle-area">
            <!-- 之前用了el-tooltip，但弹框打开关闭对它有影响，所以目前换成了title -->
            <el-button
              v-if="!row.workStatus || row.workStatus >= 2" v-btn-auth="['load:scene:save']"
              type="primary"
              icon="el-icon-edit" title="编辑"
              @click="editItem(row)"
            />
            <el-button
              v-if="!row.workStatus || row.workStatus >= 2" v-btn-auth="['load:scene:copy']"
              type="primary"
              icon="el-icon-document-copy" title="复制"
              @click="copyItem(row)"
            />
            <el-button
              v-if="!row.workStatus || row.workStatus >= 2" v-btn-auth="['load:scene:delete']"
              type="danger"
              icon="el-icon-delete" title="删除"
              @click="deleteItem(row)"
            />
            <el-button
              v-if="!row.workStatus || row.workStatus >= 2" v-btn-auth="['load:scene:execute']"
              type="primary"
              icon="el-icon-caret-right" title="执行"
              @click="toExecute(row)"
            />
            <el-button
              v-if="!row.workStatus || row.workStatus >= 2" v-btn-auth="['load:scene:savePlan']"
              type="primary"
              icon="el-icon-time" title="定时执行"
              @click="addPlanScene(row)"
            />
            <el-button
              v-if="row.workStatus >= 2" v-btn-auth="['load:scene:viewResult']"
              type="success"
              icon="el-icon-document" title="查看测试结果"
              @click="viewTestResult(row)"
            />
            <el-button
              v-if="row.workStatus >= 2" v-btn-auth="['load:scene:downErrLog']"
              type="success"
              icon="el-icon-download" title="下载错误日志"
              @click="downloadErrorLog(row)"
            />
            <el-button
              v-if="row.workStatus === 1" v-btn-auth="['load:scene:viewRunLog']"
              type="warning"
              icon="el-icon-view" title="查看运行日志"
              @click="viewRunLog(row)"
            />
            <el-button
              v-if="row.workStatus === 1" v-btn-auth="['load:scene:viewTps']"
              type="warning"
              icon="el-icon-data-analysis" title="查看TPS"
              @click="viewTps(row)"
            />
            <el-button
              v-if="row.workStatus === 1" v-btn-auth="['load:scene:stopExecute']"
              type="danger"
              icon="el-icon-time" title="停止执行"
              @click="stopExecute(row)"
            />
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { copyScene, deleteScene, stopExecuteScene, downloadErrorLog } from '@/api/load-manager';
import { executeDialogEvent, planDialogEvent } from '@/config/event';
import { toDownloadFile } from '@/utils/index.js';
export default {
  name: 'SceneTable',
  props: {
    taskId: { type: [Number, String], required: true },
    sceneList: { type: Array, required: false, default: () => [] }
  },
  inject: ['getSceneList'],
  methods: {
    // 编辑场景
    editItem(row) {
      if (!row || row.id == null) return;
      console.log('editItem', row);
      // 切换路由
      this.$router.push({ name: 'SaveScene', query: { taskId: this.taskId, sceneId: row.id }});
    },
    // 复制
    async copyItem(row) {
      if (!row || row.id == null) return;
      console.log('copyItem', row);
      try {
        await copyScene({ sceneId: row.id });
        this.$message({ type: 'success', message: '场景复制成功，请注意进行修改！' });
        this.getSceneList(); // 更新NormalScene组件的场景列表
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    // 删除
    async deleteItem(row) {
      if (!row || row.id == null) return;
      console.log('deleteItem', row);
      try {
        await this.$confirm('您是否确定要删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        // 调后端接口去删除Scene
        await deleteScene({ id: row.id });
        this.$message({ type: 'success', message: '删除成功!' });
        this.getSceneList(); // 更新父组件的场景列表
      } catch (error) {
        if (error === 'cancel') return;
        this.$message({ type: 'error', message: error.message });
      }
    },
    // 执行
    toExecute(row) {
      if (!row || row.id == null) return;
      console.log('toExecute', row);
      this.$bus.$emit(executeDialogEvent, row.id);
    },
    // 添加定时任务
    addPlanScene(row) {
      if (!row || row.id == null) return;
      console.log('addPlanScene', row);
      this.$bus.$emit(planDialogEvent, { dialogType: 'add',
        plan: {
          planId: row.planId,
          sceneId: row.id,
          stressId: this.taskId
        }
      });
    },
    // 查看测试结果
    viewTestResult(row) {
      if (!row || row.id == null) return;
      console.log('viewTestResult', row);
      // 切换路由
      this.$router.push({
        name: 'LoadResult',
        query: {
          sceneId: row.id,
          taskId: this.taskId
        }
      });
    },
    // 下载错误日志
    async downloadErrorLog(row) {
      if (!row || row.id == null) return;
      console.log('downloadErrorLog', row);
      try {
        const res = await downloadErrorLog({ sceneId: row.id });
        console.log('downloadErrorLog res', res);
        // 前端下载文件
        toDownloadFile(res, `scene_log_${row.id}.xml`);
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    // 查看运行日志
    async viewRunLog(row) {
      if (!row || row.id == null) return;
      console.log('viewRunLog', row);
      // 更新vuex中的抽屉
      await this.$store.dispatch('rightPanel/setDrawer', {
        name: 'JmeterLog', // 抽屉名，也是它对应组件的名称
        size: '60%', // 抽屉组件的宽度大小
        isShow: false, // 是否在页面右侧显示抽屉把手按钮，像设置是常驻显示的，场景执行日志就无需显示把手按钮
        params: row // 个性化传参——场景
      });
      // 打开这个抽屉
      await this.$store.dispatch('rightPanel/changeCurrentDrawer', 'JmeterLog');
    },
    // 查看TPS
    viewTps(row) {
      if (!row || row.id == null) return;
      console.log('viewTps', row);
      // 切换路由
      this.$router.push({
        name: 'ViewTps',
        query: {
          sceneId: row.id
        }
      });
    },
    // 停止执行
    async stopExecute(row) {
      if (!row || row.id == null) return;
      console.log('stopExecute', row);
      try {
        await this.$confirm('您是否确定要停止执行？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        await stopExecuteScene({ sceneId: row.id });
        this.$message({ type: 'success', message: '停止执行成功!' });
        this.getSceneList(); // 更新父组件的场景列表
      } catch (error) {
        if (error === 'cancel') return;
        this.$message({ type: 'error', message: error.message });
      }
    },
    getStatusName(row) {
      switch (row.workStatus) {
      case 0:
        this.$set(row, 'workStatusLev', 'primary');
        return '未执行';
      case 1:
        this.$set(row, 'workStatusLev', 'warning');
        return '执行中';
      case 2:
        this.$set(row, 'workStatusLev', 'success');
        return '已执行';
      case 3:
        this.$set(row, 'workStatusLev', '');
        return '已完成';
      }
    },
    getStatusIcon(row) {
      switch (row.workStatus) {
      case 0:
        return 'el-icon-mouse';
      case 1:
        return 'el-icon-loading';
      case 2:
        return 'el-icon-check';
      case 3:
        return 'el-icon-finished';
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.handle-area {
  display: flex;
  .el-button {
    margin-left: 5px;
  }
  /* 用于解决“下载错误日志”等el-tooltip再出现的问题 */
  .focusing{
    display: none ;
  }
}
.table-scene-name {
  text-decoration-line: underline;
}
</style>
