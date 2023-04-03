import { addRuleCloseBtn } from '@/utils/validate';
export const configTableValidate = {
  methods: {
    // 初始化整个form的rules
    initRules() {
      this.paramsList.forEach((item, index) => {
        this.addRules(item);
      });
    },
    // 为一行数据新添rules，默认制作成响应式的
    addRules(data, type = true) {
      if (type) {
        this.$set(data, 'paramNamesRule', this.getRules('paramNames'));
        this.$set(data, 'paramValueRule', this.getRules('paramValue'));
        this.$set(data, 'fileNameRule', this.getRules('fileName'));
      } else {
        data.paramNamesRule = this.getRules('paramNames');
        data.paramValueRule = this.getRules('paramValue');
        data.fileNameRule = this.getRules('fileName');
      }
    },
    // 每个字段的校验规则
    getRules(type) {
      switch (type) {
      case 'paramNames':
        return [{ trigger: 'blur', message: '参数名必填', validator: this.checkParam }];
      case 'paramValue':
        return [{ trigger: 'blur', message: '参数值必填', validator: this.checkParam }];
      case 'fileName':
        return [{ trigger: 'change', message: '参数文件不能为空，你需要先上传文件', validator: this.checkFileName }];
      }
    },
    // 仅用于参数校验
    checkParam(rule, value, callback, ...params) {
      if (value === '') {
        callback(new Error(rule.message)); // 页面出现校验信息
        // 表格每一项如果是输入input控件，那么校验的信息语后面我们追加了一个“X”按钮，给该按钮添加点击事件
        this.$nextTick(() => {
          addRuleCloseBtn(this.$refs.form, rule);
        });
        return;
      }
      callback();
    },
    // 仅用于文件校验
    checkFileName(rule, value, callback) {
      console.log('rule', rule);
      // 从rule.fullField也就是prop中截取处index信息
      const reg = new RegExp(/[\d{n}]/);
      const matches = reg.exec(rule.fullField);
      let index = -1;
      if (matches[0]) {
        index = parseInt(matches[0]);
      }
      // 偶现this绑定的是rules里的fileName对象，用mixin可以避免该问题
      if (this.form.paramsList[index].paramType !== '3' && !value) {
        callback(new Error(rule.message));
        return;
      }
      callback();
    }
  }
};
