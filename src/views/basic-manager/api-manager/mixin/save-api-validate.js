import { addRuleCloseBtn } from '@/utils/validate';
/** 校验器，用混入的原因是，一些校验需要使用到组件实例，因为它们的校验是关联（依赖）的  */
export const saveApiValidate = {
  // 混入时会以组件数据优先，这里次之
  data() {
    // 校验器
    const checkJmeter = (rule, value, callback) => {
      // jmeterFlag为1，才校验checkScope、referenceName、regExpression、template、matchNumber
      if (this.form.jmeterFlag) {
        // 加了validator会覆盖required（但不会隐藏红色的*），所以这里得自行校验空值
        if (value === '') {
          callback(new Error(rule.message));
          return;
        }
      }
      callback(); // jmeterFlag为0就正常放行
    };
    // 校验器
    const checkBeanshell = (rule, value, callback) => {
      // beanshellFlag为1，才校验beanshellType
      if (this.form.beanshellFlag) {
        if (value === '') {
          callback(new Error(rule.message));
          return;
        }
      }
      callback(); // beanshellFlag为0就正常放行
    };
    /**
     * 一般的字段校验加上required: true这种必填校验就可以了，并且还会生成label前面的红色的*标志。
     * 而一些特殊关联的字段，除了加上required: true显示红色的*标志，还要对它的“前提条件”进行判断，
     * 也就是给校验规则里添加validator校验器。像下面的checkScope、referenceName和regExpression就是
     * 依赖jmeterFlag这个“前提条件”，加了checkJmeter这个校验器。
     */
    const formRules = {
      apiName: [{ required: true, trigger: 'blur', message: '请填写接口名称' }],
      protocolType: [{ required: true, trigger: 'blur', message: '请选择接口协议' }],
      methodType: [{ required: true, trigger: 'blur', message: '请选择请求方式' }],
      devUsers: [{ required: true, trigger: 'blur', message: '请填写维护人' }],
      headerFlag: [{ required: true, trigger: 'blur', message: '请选择是否需要HTTP头' }],
      assertType: [{ required: true, trigger: 'blur', message: '请填写接口成功标识' }],
      assertContent: [{ required: true, trigger: 'blur', message: '请填写接口成功标识' }],
      jmeterFlag: [{ required: true, trigger: 'blur', message: '请选择是否需要接口数据关联' }],
      // 加了validator是为了“前提条件”，这里千万不要把“required: true”去掉，因为我们还需要label前面红色的*
      checkScope: [{ required: true, trigger: 'blur', message: '请选择检查范围', validator: checkJmeter }],
      referenceName: [{ required: true, trigger: 'blur', message: '请填写引用名称', validator: checkJmeter }],
      regExpression: [{ required: true, trigger: 'blur', message: '请填写正则表达式', validator: checkJmeter }],
      template: [{ required: true, trigger: 'blur', message: '请填写模板', validator: checkJmeter }],
      matchNumber: [{ required: true, trigger: 'blur', message: '请填写匹配数字', validator: checkJmeter }],
      beanshellFlag: [{ required: true, trigger: 'blur', message: '请选择是否需要添加BeanShell处理器' }],
      beanshellType: [{ required: true, trigger: 'blur', message: '请选择beanshell类型', validator: checkBeanshell }],
      uploadFlag: [{ required: true, trigger: 'blur', message: '请选择是否需要文件上传类型' }],
      apiUrl: [{ required: true, trigger: 'blur', message: '请填写url路径' }],
      apiParams: [{ required: true, trigger: 'blur', message: '请选择参数格式' }]
    };
    return {
      formRules
    };
  },
  methods: {
    // Header校验器。校验headerParams的前提是headerFlag为1，也就说功能打开了才校验，关闭了就不校验
    checkHeaderRule(rule, value, callback) {
      // headerFlag为1，才校验表格每项的input
      if (this.form.headerFlag) {
        if (value === '') {
          callback(new Error(rule.message)); // 页面出现校验信息
          // 表格每一项如果是输入input控件，那么校验的信息语后面我们追加了一个“X”按钮，给该按钮添加点击事件
          this.$nextTick(() => {
            addRuleCloseBtn(this.$refs.form, rule);
          });
          return;
        }
      }
      callback(); // headerFlag为0就正常放行
    },
    // File校验器。校验uploadParams的前提是uploadFlag为1，也就说功能打开了才校验，关闭了就不校验
    checkFileRule(rule, value, callback) {
      // uploadFlag为1，才校验表格每项的input
      if (this.form.uploadFlag) {
        if (value === '') {
          callback(new Error(rule.message));
          // 表格每一项如果是输入input控件，那么校验的信息语后面我们追加了一个“X”按钮，给该按钮添加点击事件
          this.$nextTick(() => {
            addRuleCloseBtn(this.$refs.form, rule);
          });
          return;
        }
      }
      callback(); // uploadFlag为0就正常放行
    },
    // 初始化HeaderParams的rules
    initHeaderParamsRules() {
      if (!this.form.headerParams || !this.form.headerParams.length) return;
      this.form.headerParams.forEach(item => {
        this.addHeaderParamsRules(item);
      });
    },
    // 为一行数据新添rules，默认制作成响应式的
    addHeaderParamsRules(data, type = true) {
      if (type) {
        this.$set(data, 'headerNameRule', this.getHeaderParamsRules('headerName'));
        this.$set(data, 'headerValueRule', this.getHeaderParamsRules('headerValue'));
      } else {
        data.headerNameRule = this.getHeaderParamsRules('headerName');
        data.headerValueRule = this.getHeaderParamsRules('headerValue');
      }
    },
    // 每个字段的校验规则
    getHeaderParamsRules(type) {
      switch (type) {
      case 'headerName':
        return [{ trigger: 'blur', message: 'HTTP头 header名称必填', validator: this.checkHeaderRule }];
      case 'headerValue':
        return [{ trigger: 'blur', message: 'HTTP头 header值必填', validator: this.checkHeaderRule }];
      }
    },
    // 初始化HeaderParams的rules
    initUploadParamsRules() {
      if (!this.form.uploadParams || !this.form.uploadParams.length) return;
      this.form.uploadParams.forEach(item => {
        this.addUploadParamsRules(item);
      });
    },
    // 为一行数据新添rules，默认制作成响应式的
    addUploadParamsRules(data, type = true) {
      if (type) {
        this.$set(data, 'filePathRule', this.getUploadParamsRules('filePath'));
        this.$set(data, 'fileParamRule', this.getUploadParamsRules('fileParam'));
      } else {
        data.filePathRule = this.getUploadParamsRules('filePath');
        data.fileParamRule = this.getUploadParamsRules('fileParam');
      }
    },
    // 每个字段的校验规则
    getUploadParamsRules(type) {
      switch (type) {
      case 'filePath':
        return [{ trigger: 'blur', message: '文件上传 文件路径必填', validator: this.checkFileRule }];
      case 'fileParam':
        return [{ trigger: 'blur', message: '文件上传 参数名称必填', validator: this.checkFileRule }];
      }
    }
  }
};
