<template>
  <CommTemplate :title="title">
    <!-- :model绑定表单数据this.form，:rules绑定校验规则this.formRules -->
    <el-form ref="form" :model="form" :rules="formRules" label-width="170px" label-position="right">
      <!-- 如果在el-form上加了:rules但不生效，那就是el-form-item没加prop的原因。prop的值要是form里的属性名（字符串） -->
      <el-form-item label="接口名称" prop="apiName">
        <el-input v-model="form.apiName" />
      </el-form-item>
      <el-form-item label="接口协议" prop="protocolType">
        <el-select v-model="form.protocolType">
          <el-option label="HTTP" :value="1" />
          <el-option label="HTTPS" :value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="请求方式" prop="methodType">
        <el-select v-model="form.methodType">
          <el-option label="GET" :value="1" />
          <el-option label="POST" :value="2" />
          <el-option label="PUT" :value="3" />
          <el-option label="DELETE" :value="4" />
          <el-option label="UPDATE" :value="5" />
          <el-option label="OPTIONS" :value="6" />
        </el-select>
      </el-form-item>
      <el-form-item label="接口维护人" prop="devUsers">
        <el-input v-model="form.devUsers" />
      </el-form-item>
      <el-form-item v-if="isDebug" label="HTTP头" prop="headerFlag">
        <el-radio-group v-model="form.headerFlag" @change="changeHeaderFlag">
          <el-radio border :label="1">是</el-radio>
          <el-radio border :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- transition是过渡标签，与template一样没有对应的实体标签，它的限制是只能有一个直接子元素 -->
      <transition v-if="isDebug">
        <!-- 并没有直接给table套上el-form-item，原因是想对表格的每一项input进行校验 -->
        <el-table v-show="form.headerFlag" ref="headerParams" :data="form.headerParams" border stripe>
          <el-table-column align="center" label="header名称">
            <template slot-scope="{row,$index}">
              <!-- prop必须是表单model绑定对象中的一个字段（字符串） -->
              <!-- 这里就是告诉外面这是form对象里的headerParams数组的第index对象的headerName字段（字符串） -->
              <el-form-item :prop="`headerParams[${$index}].headerName`" :rules="row.headerNameRule" label-width="0">
                <!-- 表格输入框获得焦点时清除校验信息，其他非表格的输入框就暂时不清除了，每个都要加focus很麻烦 -->
                <el-input v-model="row.headerName" />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="header值">
            <template slot-scope="{row,$index}">
              <el-form-item :prop="`headerParams[${$index}].headerValue`" :rules="row.headerValueRule" label-width="0">
                <el-input v-model="row.headerValue" />
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
      <el-form-item v-if="isDebug" label="接口成功标识" prop="assertType">
        <el-select v-model="form.assertType" style="display: inline-block; width: 27%; margin-right: 3%">
          <el-option label="响应内容包含" :value="0" />
          <el-option label="http状态码为" :value="1" />
        </el-select>
        <!-- 下拉框和输入框在同一行，并且还要对它进行校验，所以单独包了一个el-form-item -->
        <el-form-item style="display: inline-block; margin: 0; width: 70%" prop="assertContent">
          <el-input v-model="form.assertContent" />
        </el-form-item>
      </el-form-item>
      <el-form-item v-if="isDebug" label="接口数据关联" prop="jmeterFlag">
        <el-radio-group v-model="form.jmeterFlag">
          <el-radio border :label="1">是</el-radio>
          <el-radio border :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- transition是过渡标签，它的限制是只能有一个直接子元素，也就说只能有一个“儿子” -->
      <transition v-if="isDebug">
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
      <el-form-item v-if="isDebug" label="添加BeanShell处理器" prop="beanshellFlag">
        <el-radio-group v-model="form.beanshellFlag">
          <el-radio border :label="1">是</el-radio>
          <el-radio border :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <transition v-if="isDebug">
        <div v-show="form.beanshellFlag">
          <el-form-item label="处理器类型" prop="beanshellType">
            <el-select v-model="form.beanshellType">
              <el-option label="前置处理器" :value="0" />
              <el-option label="后置处理器" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="beanshell脚本内容">
            <el-input v-model="form.beanshellContent" :autosize="{ minRows: 10, maxRows: 20 }" type="textarea" />
          </el-form-item>
        </div>
      </transition>
      <el-form-item v-if="isDebug" label="文件上传类型">
        <el-radio-group v-model="form.uploadFlag" prop="uploadFlag" @change="changeUploadFlag">
          <el-radio border :label="1">是</el-radio>
          <el-radio border :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <transition v-if="isDebug">
        <el-table v-show="form.uploadFlag" ref="uploadParams" :data="form.uploadParams" border stripe>
          <el-table-column align="center" label="文件路径">
            <template slot-scope="{row,$index}">
              <!-- prop必须是表单model绑定对象中的一个字段（字符串） -->
              <!-- 这里就是告诉外面这是form对象里的uploadParams数组的第index对象的filePath字段（字符串） -->
              <el-form-item :prop="`uploadParams[${$index}].filePath`" :rules="row.filePathRule" label-width="0">
                <!-- 表格输入框获得焦点时清除校验信息，其他非表格的输入框就暂时不清除了，每个都要加focus很麻烦 -->
                <el-input v-model="row.filePath" />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column align="center" label="参数名称">
            <template slot-scope="{row,$index}">
              <el-form-item :prop="`uploadParams[${$index}].fileParam`" :rules="row.fileParamRule" label-width="0">
                <el-input v-model="row.fileParam" />
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
      <el-form-item label="URL路径" prop="apiUrl">
        <el-input v-model="form.apiUrl" />
      </el-form-item>
      <el-form-item v-if="isDebug" label="接口参数格式">
        <el-select v-model="form.paramFormatType">
          <el-option label="KeyValue" :value="1" />
          <el-option label="Json" :value="2" />
          <el-option label="Xml" :value="3" />
          <el-option label="其他" :value="4" />
          <el-option label="五" :value="5" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="isDebug" label="接口参数" prop="apiParams">
        <el-input v-model="form.apiParams" :autosize="{ minRows: 10, maxRows: 20 }" type="textarea" />
      </el-form-item>
    </el-form>
    <el-button
      type="primary"
      round
      style="display: block; width: 120px; margin: 20px auto"
      @click="saveForm"
    >保存</el-button>
  </CommTemplate>
</template>

<script>
import { Message } from 'element-ui';
import CommTemplate from '@/views/common/CommTemplate';
import { getApiById } from '@/api/basic-manager';
import { hadnleGetApiByIdResponse, hadnleSaveApiRequest, initApi } from './scripts/handle-data.js';
import { saveApiValidate } from './mixin/save-api-validate';
import { saveApi } from '@/api/basic-manager';
import { toValidate } from '@/utils/validate';
export default {
  name: 'SaveApi',
  components: {
    CommTemplate
  },
  // 将校验器混入到本实例中。使用混入的原因是，“校验”比较独立。其他的功能性代码谨慎使用混入，看似独立的功能可能以后会很耦合
  mixins: [saveApiValidate],
  data: function() {
    return {
      lastApiId: null,
      isDebug: false,
      form: initApi(this.projectId)
    };
  },
  computed: {
    title() {
      return this.$route.query.apiId ? '编辑接口' : '新增接口';
    },
    projectId() {
      return this.$route.query.projectId;
    },
    apiId() {
      return this.$route.query.apiId;
    }
  },
  /* created() {
    this.getApiById();
  }, */
  activated() {
    // 如果不是上一次的api，就得重置输入内容
    if (this.lastApiId !== this.apiId) {
      this.form = initApi(this.projectId);
    }
    this.getApiById();
    this.lastApiId = this.apiId;
  },
  methods: {
    async getApiById() {
      if (this.apiId == null) return;
      try {
        const { content } = await getApiById({ id: this.apiId });
        console.log('getApiById content', content);
        this.form = hadnleGetApiByIdResponse(content); // 直接赋给form，会将data处理成响应式的数据的
        // 初始化HeaderParams的校验规则
        this.initHeaderParamsRules();
        // 初始化UploadParams的校验规则
        this.initUploadParamsRules();
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    changeHeaderFlag() {
      // headerFlag为1时，并且headerParams没有一项时才添加新的一项
      if (this.form.headerFlag) {
        const newItem = { headerName: '', headerValue: '' };
        // 为新添的这项添加它的rules
        this.addHeaderParamsRules(newItem, false);
        // this.$set和push都能响应式
        if (!this.form.headerParams) {
          // 生成新的响应式数据
          this.$set(this.form, 'headerParams', [newItem]);
        } else if (!this.form.headerParams.length) {
          // form.headerParams存在，它是个数组，直接插入新数据
          this.form.headerParams.push(newItem);
        }
      }
    },
    changeUploadFlag() {
      // uploadFlag为1时，并且uploadParams没有一项时才添加新的一项
      if (this.form.headerFlag) {
        const newItem = { filePath: '', fileParam: '' };
        // 为新添的这项添加它的rules
        this.addUploadParamsRules(newItem, false);
        // this.$set和push都能响应式
        if (!this.form.uploadParams) {
          // 生成新的响应式数据
          this.$set(this.form, 'uploadParams', [newItem]);
        } else if (!this.form.uploadParams.length) {
          // form.uploadParams存在，它是个数组，直接插入新数据
          this.form.uploadParams.push(newItem);
        }
      }
    },
    // 给header表格添加一行
    addHeaderRow(index) {
      const newItem = { headerName: '', headerValue: '' };
      // 为新添的这项添加它的rules
      this.addHeaderParamsRules(newItem, false);
      this.form.headerParams.splice(index + 1, 0, newItem); // 在它后面添加一项
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
      const newItem = { filePath: '', fileParam: '' };
      // 为新添的这项添加它的rules
      this.addUploadParamsRules(newItem, false);
      this.form.uploadParams.splice(index + 1, 0, newItem); // 在它后面添加一项
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
        const validateRlt = await toValidate(this.$refs.form); // 校验表单
        if (!validateRlt) return false; // 校验没通过
        const params = hadnleSaveApiRequest(this.form); // 请求数据处理
        await saveApi(params); // 向服务器发起请求
        this.$message({ type: 'success', message: '保存成功！' });
        // 回到接口管理
        this.$router.push({
          name: 'ApiManager',
          query: {
            projectId: this.form.projectId
          }
        });
      } catch (error) {
        this.$message({ type: 'error', message: '保存失败！' });
      }
    }
  },
  // 通过路由规则进入组件时被调用，此时组件实例还未生成
  beforeRouteEnter(to, from, next) {
    if (to.query.projectId == null) {
      // 组件实例还未生成，所以不能使用this.$message，那么就用Message
      Message.error('进入“接口配置页面”需要传递projectId！已帮你重定向到“接口管理页面”');
      next({ name: 'ProjectManager' });
    }
    next();
  },
  // 路由地址改变，包括浏览器地址后面的参数被去掉再回车，就会触发这个钩子
  beforeRouteUpdate(to, from, next) {
    // 只验证本组件的
    if (to.name === 'SaveApi' && to.query.projectId == null) {
      Message.error('进入“接口配置页面”需要传递projectId！已帮你重定向到“接口管理页面”');
      next({ name: 'ProjectManager' });
    }
    next();
  }
};
</script>

<style lang="scss" scoped>
.el-form {
  margin: 30px 20px;
  .el-form-item {
    width: 65%;
    margin-left: 10%; /* width和margin-left的作用下，让操作区域尽量在中间靠左一点 */
  }
  /* 表格没有用el-form-item套着，所以单独拉出来写样式 */
  .el-table {
    width: calc(65% - 170px); /* 表格比el-form-item要短170px，这170px是el-form-item的label宽度 */
    margin-left: calc(10% + 170px); /* 把多出的170px分给左外边距 */
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
