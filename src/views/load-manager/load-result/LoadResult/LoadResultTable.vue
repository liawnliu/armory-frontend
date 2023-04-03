<template>
  <div>
    <el-table :data="resultList" style="width: 100%" border stripe>
      <el-table-column align="center" label="结果ID" width="100">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="结果名">
        <template slot-scope="scope">
          <!-- 如果name存在于resourceMap中，证明路由存在可以跳转，否则跳到404notFound页面 -->
          <router-link
            class="table-result-name"
            :to="{name:'ResultDetail',
                  query: {resultId: scope.row.id, sceneId, taskId, conn: scope.row.cons, tps: scope.row.tps}}"
          >{{ scope.row.resultName }}</router-link>
        </template>
      </el-table-column>
      <el-table-column align="center" label="性能数据" width="100">
        <template slot-scope="scope"> TPS: {{ scope.row.tps }}<br>RT: {{ scope.row.rpsTime }}ms </template>
      </el-table-column>
      <el-table-column align="header-center" label="创建时间" prop="createTime" width="160" />
      <el-table-column align="header-center" label="测试人员" prop="userName" width="100" />
      <el-table-column align="header-center" label="添加至报表" width="100">
        <template slot-scope="scope">
          {{ scope.row.resultFlag == 1 ? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="监控数据" width="100">>
        <template slot-scope="scope">
          <el-button
            v-btn-auth="['load:loadResult:serverLoad']" type="primary"
            @click="openWatchDialog(scope)"
          >添加/修改</el-button>
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="操作" width="100">>
        <template slot-scope="scope">
          <el-button
            v-btn-auth="['load:loadResult:delete']" type="danger"
            @click="handleDelete(scope)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :visible.sync="dialogVisible" title="添加/修改监控数据" :close-on-click-modal="false" @close="dialogClose">
      <el-form ref="form" :model="form" :rules="rules" style="width: 90%; margin: auto">
        <el-form-item label="监控数据" prop="serverLoad">
          <el-input v-model.lazy="form.serverLoad" :autosize="{ minRows: 5, maxRows: 10 }" type="textarea" />
        </el-form-item>
      </el-form>
      <div style="width: 30%; margin: 20px 0 auto auto; padding: 0">
        <el-button type="primary" @click="saveServerLoad()">保存</el-button>
        <el-button type="danger" style="margin-left: 30px" @click="dialogVisible = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { saveResult, deleteResult } from '@/api/load-manager';
export default {
  name: 'LoadResultTable',
  props: {
    resultList: { type: Array, required: false, default: () => [] }
  },
  data() {
    return {
      form: { serverLoad: '' },
      dialogVisible: false,
      currHandleRow: null,
      rules: {
        serverLoad: [{ required: true, trigger: 'blur', message: '请填写监控数据' }]
      }
    };
  },
  computed: {
    sceneId() {
      return this.$route.query.sceneId;
    },
    taskId() {
      return this.$route.query.taskId;
    }
  },
  inject: ['getResultList'],
  methods: {
    // 打开更新监控数据的弹窗
    openWatchDialog(scope) {
      this.currHandleRow = scope.row.id;
      this.form.serverLoad = this.resultList[scope.$index].serverLoad;
      this.dialogVisible = true;
    },
    // 更新监控数据
    saveServerLoad() {
      this.$refs.form.validate(async(result, msgObj) => {
        console.log('saveForm result', result);
        console.log('saveForm msg', msgObj);
        if (result) {
          try {
            await saveResult({ serverLoad: this.form.serverLoad, id: this.currHandleRow });
            this.$message({ type: 'success', message: '更新监控数据成功！' });
            this.dialogVisible = false;
            this.getResultList(); // 更新LoadResult组件的列表
          } catch ({ message }) {
            this.$message({ type: 'error', message });
          }
        } else {
          if (msgObj && typeof msgObj === 'object') {
            for (const key in msgObj) {
              // 只提示第一条信息
              const message = msgObj[key] && msgObj[key].length && msgObj[key][0] ? msgObj[key][0].message : '';
              this.$message({ type: 'error', message: message || '校验不通过' });
              break;
            }
          }
        }
      });
    },
    async handleDelete(id) {
      if (id == null) return;
      try {
        await this.$confirm('您是否确定要删除?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        // 调后端接口去删除api
        await deleteResult({ id });
        this.$message({ type: 'success', message: '删除成功!' });
        this.getResultList(); // 更新LoadResult组件的列表
      } catch (error) {
        if (error === 'cancel') return;
        this.$message({ type: 'error', message: error.message });
      }
    },
    dialogClose() {
      this.form.serverLoad = '';
    }
  }
};
</script>

<style lang="scss" scoped>
.table-result-name {
  text-decoration-line: underline;
}
</style>
