<template>
  <el-form ref="form" :model="form">
    <el-table ref="configTable" :data="form.paramsList" style="width: 100%" border stripe>
      <!-- align对齐方式，label列名 -->
      <el-table-column align="center" label="参数名" width="220">
        <template slot-scope="{row,$index}">
          <el-form-item :prop="`paramsList[${$index}].paramNames`" :rules="row.paramNamesRule">
            <el-input v-model.lazy="row.paramNames" placeholder="多个参数，逗号隔开" />
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column align="center" label="参数类型" width="220">
        <template slot-scope="scope">
          <el-form-item :prop="`paramsList[${scope.$index}].paramType`">
            <el-select v-model="scope.row.paramType">
              <el-option label="文件-可重复" value="1" />
              <el-option label="文件-唯一值" value="2" />
              <el-option label="固定值" value="3" />
            </el-select>
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="参数值" width="300">
        <template slot-scope="{row,$index}">
          <el-form-item
            v-if="row.paramType === '3'"
            :prop="`paramsList[${$index}].paramValue`"
            :rules="row.paramValueRule"
          >
            <el-input v-model="row.paramValue" />
          </el-form-item>
          <!-- 上传文件。ref为每一行的上传文件组件打上自己的标记，class绑定样式，multiple设置选择文件时只能选单个， -->
          <!-- limit表示文件列表限制个数，name上传的文件字段名（非文件名），在上传时需要的，服务器也会进行校验，-->
          <!-- auto-upload取消自动上传服务器，on-exceed在文件多于limit时触发，可用于手动覆盖已有文件 -->
          <!-- 没用action，用的是http-request，但action是必填项，http-request覆盖默认的上传行为，可以自定义上传的实现。 -->
          <el-upload
            v-else
            :ref="`upload${$index}`"
            class="file-upload"
            :multiple="false"
            :limit="1"
            name="uploadFile"
            :auto-upload="false"
            :on-exceed="switchFile"
            :http-request="toUpload"
            action=""
          >
            <el-button slot="trigger" type="primary">选择文件</el-button>
            <el-button type="success" @click="submitUpload($index)">上传</el-button>
            <el-button type="warning" @click="selectExist($index)">选择已有文件</el-button>
          </el-upload>
        </template>
      </el-table-column>
      <el-table-column align="header-center" label="使用文件">
        <template slot-scope="{row,$index}">
          <el-form-item :prop="`paramsList[${$index}].fileName`" :rules="row.paramValueRule">
            {{ row.fileName }}
          </el-form-item>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="100">
        <template slot-scope="scope">
          <el-button type="danger" @click="handleDelete(scope.$index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-button
      type="primary"
      round
      style="display: block; width: 120px; margin: 30px auto"
      @click="saveForm"
    >保存</el-button>
  </el-form>
</template>

<script>
import { saveGlobalVars, uploadParamFile } from '@/api/basic-manager';
import { hadnleSaveFormRequest } from '../scripts/handle-data';
import { configTableValidate } from '../mixin/config-table-validate';
import { selectFileDialogEvent, addConfigTableItemEvent } from '@/config/event';
import { toValidate } from '@/utils/validate';
export default {
  name: 'ConfigTable',
  mixins: [configTableValidate],
  props: {
    paramsList: {
      type: Array,
      required: true,
      default: () => []
    },
    projectId: {
      type: [Number, String],
      required: true
    },
    createUserId: {
      type: [Number, String],
      required: true
    }
  },
  data() {
    return {
      form: { paramsList: [] },
      currIndex: -1 // 当前操作的是表格中的第几行，这是用于文件上传成功后更新表格里的fileName字段
    };
  },
  watch: {
    paramsList: {
      handler(newValue) {
        if (!newValue || !newValue.length) return;
        // 本组件的paramsList会是一个“正操作”的数据，为了不影响数据源，用slice会生成一个新数组
        // newValue指向的是props中的paramsList，它又来自于父组件，原则上是不能修改props数据的，所以这里必须生成新数组对象
        this.form.paramsList = [...newValue];
        // 初始化校验规则
        this.initRules();
      }
    }
  },
  mounted() {
    // 添加变量
    this.$bus.$on(addConfigTableItemEvent, () => {
      const newItem = { paramNames: '', paramType: '1', fileName: '', projectId: this.projectId };
      // 新增校验规则，暂时不用做成响应式，下面的push会帮你做成响应式
      this.addRules(newItem, false);
      this.form.paramsList.push(newItem);
    });
  },
  beforeDestroy() {
    this.$bus.$off(addConfigTableItemEvent);
  },
  methods: {
    // 删除表格某一行
    handleDelete(index) {
      this.form.paramsList.splice(index, 1);
    },
    // 目前需求是文件只允许存在一个，如果新选择了一个，那就替换以前的
    switchFile(files, fileList) {
      if (!files || !fileList || !files.length || !fileList.length) return;
      console.log('fileList[0]', fileList[0]);
      console.log('files[0]', files[0]);
      fileList[0].name = files[0].name;
      fileList[0].size = files[0].size;
      // 不要奇怪，因为fileList[0].raw是个File类型，而files[0]本身就是个File类型，所以这里不是fileList[0].raw = files[0].raw
      fileList[0].raw = files[0];
    },
    // 点击“上传”按钮，通知上传文件的组件去上传，我们要保存index，因为要区分是哪一行的上传文件组件进行上传操作
    submitUpload(index) {
      console.log('uploadFiles', this.$refs[`upload${index}`].uploadFiles);
      // 这里校验的是uploadFiles而不是fileList
      if (!this.$refs[`upload${index}`].uploadFiles.length) {
        this.$message({ type: 'error', message: `请先选择要上传的文件！` });
        return;
      }
      this.currIndex = index;
      // 实际上就是触发action或者http-request，这里我们用的是http-request，绑定this.toUpload()
      this.$refs[`upload${index}`].submit();
    },
    // 上传
    async toUpload(param) {
      console.log('param', param);
      if (!param.filename || !param.file) return;
      const data = new FormData();
      data.append(param.filename, param.file);
      try {
        await uploadParamFile(data, this.projectId);
        this.$message({ type: 'success', message: `文件${param.file.name}上传成功！` });
        if (this.currIndex > -1) {
          // 清空已上传的文件列表（该方法不支持在 before-upload 中调用）
          this.$refs[`upload${this.currIndex}`].clearFiles();
          // 更新表格里的fileName字段
          this.form.paramsList[this.currIndex].fileName = param.file.name;
          // 还要清空以前的校验信息
          this.$refs.form.clearValidate(`paramsList[${this.currIndex}].fileName`);
        }
        this.currIndex = -1; // 还原
      } catch (error) {
        this.$message({ type: 'error', message: `文件${param.file.name}上传失败！` });
        this.currIndex = -1; // 还原
      }
    },
    changeFile(fileName) {
      this.form.paramsList[this.currIndex].fileName = fileName;
      // 清除这一项的校验提示
      this.$refs.form.clearValidate(`paramsList[${this.currIndex}].fileName`);
      this.currIndex = -1;
    },
    // 选择已有文件
    selectExist(index) {
      this.currIndex = index;
      this.$bus.$emit(selectFileDialogEvent, { createUserId: this.createUserId, changeFile: this.changeFile });
    },
    // 保存整个表单数据
    async saveForm() {
      console.log('form.paramsList', this.form.paramsList);
      try {
        const validateRlt = await toValidate(this.$refs.form); // 校验表单
        if (!validateRlt) return false; // 校验没通过
        // 请求数据处理
        const params = hadnleSaveFormRequest(this.form.paramsList, this.projectId);
        // 调后端接口，如果接口请求成功但还是没保存成功就检查一下Content-Type
        await saveGlobalVars(params);
        this.$message({ type: 'success', message: '参数保存成功！' });
        // 回到工程管理
        this.$router.push({ name: 'ProjectManager' });
      } catch ({ message }) {
        this.$message({ type: 'error', message: '参数保存失败！' });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.el-table {
  .el-form-item {
    margin: 2px;
  }
  .file-upload {
    display: flex;
    width: 100%;
    /* 换行，主轴是横轴 */
    flex-flow: wrap row;
    ::v-deep {
      .el-upload {
        order: 0; /* “选择文件”按钮放在最前面 */
        width: 30%;
        margin-bottom: 8px;
        .el-button {
          width: 100%;
        }
      }
      .el-upload-list {
        order: 1; /* “文件列表”放在第二个 */
        margin-left: 2%;
        width: 68%; /* 让“选择文件”按钮和“文件列表”在第一行 */
        /* 文件那项，文字 */
        .el-upload-list__item {
          font-size: 15px;
          line-height: 18px;
          &:first-child {
            margin-top: 5px;
          }
        }
        /* 删除按钮 */
        .el-icon-close {
          top: 2px;
          right: 10px;
        }
      }
      .el-button {
        order: 2; /* 剩余两个按钮在第二行 */
      }
      .el-button--success {
        width: 30%; /* 让第三个按钮与“选择文件”按钮一样宽 */
      }
    }
  }
}
</style>
