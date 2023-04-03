<template>
  <div>
    <h3 style="color: #73879c; font-weight: 500; text-align: center">【{{ api.apiName }}】接口信息</h3>
    <el-form
      ref="form" :model="form"
      :rules="rules"
      label-width="100px"
      label-position="right"
      style="margin-right: 20px;"
    >
      <el-form-item label="接口名称" prop="apiName">
        <el-input :value="form.apiName" disabled />
      </el-form-item>
      <el-form-item label="接口备注" prop="remark">
        <el-input v-model="form.remark" />
      </el-form-item>
      <div style="display: flex; justify-content: space-between">
        <el-form-item label="接口协议" prop="protocolType" style="width: 33%">
          <!-- HTTP、HTTPS -->
          <el-input :value="form.protocolType=== 1 ? 'HTTP' : 'HTTPS'" disabled />
        </el-form-item>
        <el-form-item label="请求方式" prop="methodType" style="width: 33%">
          <!-- GET、POST、PUT、DELETE、UPDATE、OPTIONS -->
          <el-input :value="getMethodType(form.methodType)" disabled />
        </el-form-item>
        <el-form-item label="接口维护人" prop="devUsers" style="width: 33%">
          <el-input :value="form.devUsers" disabled />
        </el-form-item>
      </div>
      <el-form-item label="URL路径" prop="apiUrl">
        <el-input :value="form.apiUrl" disabled />
      </el-form-item>
      <!-- 如果在el-form上加了:rules但不生效，那就是el-form-item没加prop的原因。prop的值要是form里的属性名（字符串） -->
      <el-form-item label="HTTP头" prop="headerFlag">
        <el-radio-group v-model="form.headerFlag" @change="changeHeaderFlag">
          <el-radio border :label="1">是</el-radio>
          <el-radio border :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- transition是过渡标签，与template一样没有对应的实体标签，它的限制是只能有一个直接子元素 -->
      <transition>
        <!-- 并没有直接给table套上el-form-item，原因是想对表格的每一项input进行校验 -->
        <el-table v-show="form.headerFlag" ref="headerParams" :data="form.headerParams" border stripe>
          <el-table-column align="center" label="header名称">
            <template slot-scope="scope">
              <!-- prop必须是表单model绑定对象中的一个字段（字符串） -->
              <!-- 这里就是告诉外面这是form对象里的headerParams数组的第index对象的headerName字段（字符串） -->
              <el-form-item :prop="`headerParams[${scope.$index}].headerName`" label-width="0">
                <!-- 表格输入框获得焦点时清除校验信息，其他非表格的输入框就暂时不清除了，每个都要加focus很麻烦 -->
                <el-input v-model="scope.row.headerName" />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="header值">
            <template slot-scope="scope">
              <el-form-item :prop="`headerParams[${scope.$index}].headerValue`" label-width="0">
                <el-input v-model="scope.row.headerValue" />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" min-width="50">
            <template slot-scope="scope">
              <el-button @click="addHeaderRow(scope.$index)">+</el-button>
              <el-button @click="deleteHeaderRow(scope.$index)">-</el-button>
            </template>
          </el-table-column>
        </el-table>
      </transition>
      <el-form-item label="接口成功标识" prop="assertType">
        <el-select v-model="form.assertType" style="display: inline-block; width: 27%; margin-right: 3%">
          <el-option label="响应内容包含" :value="0" />
          <el-option label="http状态码为" :value="1" />
        </el-select>
        <!-- 下拉框和输入框在同一行，并且还要对它进行校验，所以单独包了一个el-form-item -->
        <el-form-item style="display: inline-block; margin: 0; width: 70%" prop="assertContent">
          <el-input v-model="form.assertContent" />
        </el-form-item>
      </el-form-item>
      <el-form-item label="接口数据关联" prop="jmeterFlag">
        <el-radio-group v-model="form.jmeterFlag">
          <el-radio border :label="1">是</el-radio>
          <el-radio border :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- transition是过渡标签，它的限制是只能有一个直接子元素，也就说只能有一个“儿子” -->
      <transition>
        <div v-show="form.jmeterFlag">
          <el-form-item label="检查范围" prop="checkScope">
            <el-select v-model="form.checkScope">
              <el-option label="body" :value="0" />
              <el-option label="header" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="保存参数" prop="referenceName">
            <el-input v-model="form.referenceName" />
          </el-form-item>
          <el-form-item label="正则表达式" prop="regExpression">
            <el-input v-model="form.regExpression" />
          </el-form-item>
          <el-form-item label="模板" prop="template">
            <el-input v-model="form.template" />
          </el-form-item>
          <el-form-item label="匹配数字" prop="matchNumber">
            <el-input v-model="form.matchNumber" />
          </el-form-item>
        </div>
      </transition>
      <el-form-item label="BeanShell前置处理器" prop="beanshellPreFlag">
        <el-radio-group v-model="form.beanshellPreFlag">
          <el-radio border :label="1">是</el-radio>
          <el-radio border :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <transition>
        <div v-show="form.beanshellPreFlag">
          <el-form-item label="beanshell脚本内容">
            <el-input v-model="form.beanshellPreContent" :autosize="{ minRows: 5, maxRows: 10 }" type="textarea" />
          </el-form-item>
        </div>
      </transition>
      <el-form-item label="BeanShell后置处理器" prop="beanshellPostFlag">
        <el-radio-group v-model="form.beanshellPostFlag">
          <el-radio border :label="1">是</el-radio>
          <el-radio border :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <transition>
        <div v-show="form.beanshellPostFlag">
          <el-form-item label="beanshell脚本内容">
            <el-input v-model="form.beanshellPostContent" :autosize="{ minRows: 5, maxRows: 10 }" type="textarea" />
          </el-form-item>
        </div>
      </transition>
      <el-form-item label="文件上传类型">
        <el-radio-group v-model="form.uploadFlag" prop="uploadFlag" @change="changeUploadFlag">
          <el-radio border :label="1">是</el-radio>
          <el-radio border :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <transition>
        <el-table v-show="form.uploadFlag" ref="uploadParams" :data="form.uploadParams" border stripe>
          <el-table-column align="center" label="文件路径">
            <template slot-scope="scope">
              <!-- prop必须是表单model绑定对象中的一个字段（字符串） -->
              <!-- 这里就是告诉外面这是form对象里的uploadParams数组的第index对象的filePath字段（字符串） -->
              <el-form-item :prop="`uploadParams[${scope.$index}].filePath`" label-width="0">
                <!-- 表格输入框获得焦点时清除校验信息，其他非表格的输入框就暂时不清除了，每个都要加focus很麻烦 -->
                <el-input v-model="scope.row.filePath" />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="参数名称">
            <template slot-scope="scope">
              <el-form-item :prop="`uploadParams[${scope.$index}].fileParam`" label-width="0">
                <el-input v-model="scope.row.fileParam" />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作" min-width="50">
            <template slot-scope="scope">
              <el-button @click="addFileRow(scope.$index)">+</el-button>
              <el-button @click="deleteFileRow(scope.$index)">-</el-button>
            </template>
          </el-table-column>
        </el-table>
      </transition>
      <el-form-item label="接口参数格式">
        <el-select v-model="form.paramFormatType">
          <el-option label="KeyValue" :value="1" />
          <el-option label="Json" :value="2" />
          <el-option label="Xml" :value="3" />
          <el-option label="其他" :value="4" />
          <el-option label="五" :value="5" />
        </el-select>
      </el-form-item>
      <el-form-item label="接口参数" prop="apiParams">
        <el-input v-model="form.apiParams" :autosize="{ minRows: 5, maxRows: 10 }" type="textarea" />
      </el-form-item>
      <div style="display: flex; justify-content: space-between">
        <el-form-item label="比例%" prop="ratio" style="width: 25%">
          <el-input v-model="form.ratio" />
        </el-form-item>
        <el-form-item label="预期TPS" prop="targetTps" style="width: 25%">
          <el-input v-model="form.targetTps" />
        </el-form-item>
        <el-form-item label="预期RT" prop="targetRt" style="width: 25%">
          <el-input v-model="form.targetRt" />
        </el-form-item>
        <el-form-item label="最大TPS" prop="maxTps" style="width: 25%">
          <el-input v-model="form.maxTps" />
        </el-form-item>
      </div>
    </el-form>
    <el-button
      type="primary"
      round
      style="display: block; width: 120px; margin: 20px auto"
      @click="saveForm"
    >保存</el-button>
  </div>
</template>

<script>
import { initSceneApi } from '../scripts/handle-data';
import { toValidate } from '@/utils/validate';
export default {
  name: 'SaveSceneApi',
  props: {
    api: { type: Object, required: true, default: () => {} },
    saveFun: { type: Function, required: true, default: () => {} }
  },
  data() {
    // 如果校验器里有多种提示，那么首先得把rule里自带的message给去掉，然后才能有多个callback(new Error('xxx'))
    const checkRatio = (rule, value, callback) => {
      if (typeof value === 'string') {
        if (value === '') {
          return callback(new Error('请填写比例'));
        }
        if (value.indexOf('%') !== -1) {
          return callback(new Error('“比例”请填写成数值'));
        }
        const ratio = Number(value);
        if (ratio < 0 || ratio > 100) {
          return callback(new Error('“比例”请填写0-100的数值'));
        }
      } else if (typeof value === 'number') {
        if (value < 0 || value > 100) {
          return callback(new Error('“比例”请填写0-100的数值'));
        }
      }
      callback();
    };
    return {
      form: {},
      rules: {
        remark: [{ required: true, trigger: 'blur', message: '请填写接口备注' }],
        assertContent: [{ required: true, trigger: 'blur', message: '请填写接口成功标识' }],
        // 如果校验器里有多种提示，那么首先得把rule里自带的message给去掉，然后才能有多个callback(new Error('xxx'))
        ratio: [{ required: true, trigger: 'blur', validator: checkRatio }]
      }
    };
  },
  watch: {
    api: {
      immediate: true,
      handler(val) {
        console.log('api val', val);
        if (val.apiName) {
          const headerParams = val.headerParams ? JSON.parse(val.headerParams) : [];
          const uploadParams = val.uploadParams ? JSON.parse(val.uploadParams) : [];
          this.form = { ...initSceneApi(), ...val, headerParams, uploadParams };
        } else {
          this.form = { ...initSceneApi() };
        }
      }
    }
  },
  methods: {
    getMethodType(type) {
      let methodType = '';
      switch (type) {
      case 1:
        methodType = 'GET';
        break;
      case 2:
        methodType = 'POST';
        break;
      case 3:
        methodType = 'PUT';
        break;
      case 4:
        methodType = 'DELETE';
        break;
      case 5:
        methodType = 'UPDATE';
        break;
      case 6:
        methodType = 'OPTIONS';
        break;
      }
      return methodType;
    },
    changeHeaderFlag() {
      // headerFlag为1时，并且headerParams没有一项时才添加新的一项
      if (this.form.headerFlag) {
        // this.$set和push都能响应式
        if (!this.form.headerParams) {
          // 生成新的响应式数据
          this.$set(this.form, 'headerParams', [{ headerName: '', headerValue: '' }]);
        } else if (!this.form.headerParams.length) {
          // form.headerParams存在，它是个数组，直接插入新数据
          this.form.headerParams.push({ headerName: '', headerValue: '' });
        }
      }
    },
    changeUploadFlag() {
      // uploadFlag为1时，并且uploadParams没有一项时才添加新的一项
      if (this.form.headerFlag) {
        // this.$set和push都能响应式
        if (!this.form.uploadParams) {
          // 生成新的响应式数据
          this.$set(this.form, 'uploadParams', [{ filePath: '', fileParam: '' }]);
        } else if (!this.form.uploadParams.length) {
          // form.uploadParams存在，它是个数组，直接插入新数据
          this.form.uploadParams.push({ filePath: '', fileParam: '' });
        }
      }
    },
    // 给header表格添加一行
    addHeaderRow(index) {
      this.form.headerParams.splice(index + 1, 0, { headerName: '', headerValue: '' }); // 在它后面添加一项
    },
    // 给header表格删除一行
    deleteHeaderRow(index) {
      if (this.form.headerParams.length === 1) {
        this.form.headerFlag = 0; // 将“HTTP头”这项置为“否”
      }
      this.form.headerParams.splice(index, 1); // 删除一项
    },
    // 给file表格添加一行
    addFileRow(index) {
      this.form.uploadParams.splice(index + 1, 0, { filePath: '', fileParam: '' }); // 在它后面添加一项
    },
    // 给file表格删除一行
    deleteFileRow(index) {
      if (this.form.uploadParams.length === 1) {
        this.form.uploadFlag = 0; // 将“文件上传类型”这项置为“否”
      }
      this.form.uploadParams.splice(index, 1); // 删除一项
    },
    async saveForm() {
      console.log('form', this.form);
      try {
      // 校验
        const validateRlt = await toValidate(this.$refs.form); // 校验表单
        if (!validateRlt) return false; // 校验没通过
        // 去保存
        this.saveFun({ ...this.form });
      } catch (error) {
        this.$message({ type: 'error', message: error.message });
      }
    }
  }
};
</script>

<style lang='scss' scoped>
.el-form {
  margin: 30px 20px;
  ::v-deep {
    .el-input.is-disabled .el-input__inner {
      color: #606266;
      background-color: #e6e8eb;
    }
  }
  /* 表格没有用el-form-item套着，所以单独拉出来写样式 */
  .el-table {
    width: calc(100% - 100px); /* 表格比el-form-item要短100px，这130px是el-form-item的label宽度 */
    margin-left: 100px; /* 把多出的100px分给左外边距 */
    margin-bottom: 15px;
    .el-form-item {
      width: 100%; /* 清除外界的el-form-item对表格内部的el-form-item影响 */
      margin: 0; /* 清除外界的el-form-item对表格内部的el-form-item影响 */
    }
    ::v-deep {
      .el-button {
        /* 表里的操作按钮 */
        color: #fff;
        background-color: #398439;
        &:hover {
          background-color: #449d44;
        }
      }
    }
  }
  /* 过渡信息写在这两个类名里 */
  .v-enter-active,
  .v-leave-active {
    transition: opacity 0.7s linear;
  }
  /* 进入过程的开始状态就是0，并且离开过程的结束状态也是0 */
  .v-enter,
  .v-leave-to {
    opacity: 0;
  }
  /* 进入过程的结束状态就是1，并且离开过程的开始状态也是1 */
  .v-enter-to,
  .v-leave {
    opacity: 1;
  }
}
</style>
