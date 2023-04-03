export const projectDialogValidate = {
  data() {
    const check = (rule, value, callback) => {
      // 偶现this绑定的是rules里的accLtestCont里的对象，用mixin可以避免该问题
      if (!this.project.accLtestCont && !this.project.accOnlineCont) {
        callback(new Error(rule.message));
        return;
      }
      callback();
    };
    const rules = {
      projectName: [{ required: true, trigger: 'blur', message: '请填写工程名称' }],
      accLtestCont: [{ trigger: 'blur', message: '压测环境地址/线上环境地址至少配置一个', validator: check }],
      accOnlineCont: [{ trigger: 'blur', message: '压测环境地址/线上环境地址至少配置一个', validator: check }],
      version: [{ required: true, trigger: 'blur', message: '请填写版本号' }]
    };
    return { rules };
  }
};
