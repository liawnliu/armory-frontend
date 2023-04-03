import Vue from 'vue';
/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path);
}
export function addRuleCloseBtn(form, rule) {
  // 获取该rule对应的el-form-item组件
  const formItem = form.fields.find(item => (item.prop === rule.fullField));
  if (!formItem) return;
  // 获取el-form-item组件的元素
  const formItemEl = formItem.$el;
  console.log('formItemEl', formItemEl);
  // 获取它下面的输入框元素
  const inputEl = formItemEl.querySelector('.el-input');
  if (!inputEl) return;
  // 输入框后面的兄弟组件是.el-form-item__error，也就是校验信息提示语
  const errEl = inputEl.nextElementSibling;
  if (!errEl) return;
  console.log('inputEl', inputEl);
  console.log('errEl', errEl);
  // 给“校验信息提示语”加上一个叉按钮，具体在CommTemplate.vue里有它的样式。注意，这里没有直接加载errEl，
  // 原因是原始rules此刻有新添的，那就会立马清除.el-form-item__error的其他class，所以我们加到它所在的formItemEl上
  formItemEl.classList && !formItemEl.classList.contains('error-msg') && formItemEl.classList.add('error-msg');
  // 给这条提示语加上点击事件（其他普通提示语是没有点击响应的）
  errEl.addEventListener(
    'click',
    () => {
      // 移除校验信息，如果是item.remove，第二次校验就会有问题
      formItem.clearValidate();
      // firstElementChild是第一个子元素。让input获得焦点
      inputEl.firstElementChild.focus();
    },
    { capture: true, once: true } // 捕获时就执行，once表示执行一次后立即移除事件监听
  );
}
// const form = {
//   validate(callback){
//     // .....
//    const result = true;
//     callback(result, msgObj)
//   }
// }
export function toValidate(form) {
  return new Promise((resolve, reject) => {
    // 校验表单的所有校验规则
    form.validate((result, msgObj) => {
      console.log('toValidate result', result);
      console.log('toValidate msg', msgObj);
      if (result) {
        resolve(true);
      } else {
        let message = '';
        if (msgObj && typeof msgObj === 'object') {
          for (const key in msgObj) {
            // 只提示第一条信息
            message = msgObj[key] && msgObj[key].length && msgObj[key][0] ? msgObj[key][0].message : '';
            break;
          }
        }
        // 让第一条校验信息所在div，自动滚动到可视窗口的中间部位
        Vue.nextTick(() => {
          const errEl = form.$el.querySelector('.el-form-item__error');
          console.log('formErrorScroll errEl', errEl);
          if (errEl) {
            errEl.scrollIntoView({
              block: 'center', // start顶部对齐，center中间对齐，end底部对齐
              behavior: 'smooth' // 定义过渡动画
            });
          }
        });
        reject(new Error(message || '校验不通过'));
      }
    });
  });
}
/* // 表格每一项如果是输入input控件，那么校验的信息语后面我们追加了一个“X”按钮，给该按钮添加点击事件
addRuleCloseEvent(rule) {
  this.$nextTick(() => {
    // 避免使用document.querySelectorAll这样全局式搜索，可以使用ref再去搜索
    const nodes = this.$refs.configTable.$el.querySelectorAll('.el-form-item__content .el-form-item__error');
    console.log('nodes', nodes);
    for (let i = 0; i < nodes.length; i++) {
      const item = nodes[i];
      // previousElementSibling是它前一个兄弟元素
      const brother = item.previousElementSibling;
      // 如果它没有打上标记，并且它前一个兄弟是.el-input元素，就给它就是点击事件
      if (!brother || !brother.classList.contains('el-input') || item.getAttribute('addClickFlag') === '1') {
        continue;
      }
      item.classList.add('error-msg'); // 区分普通的error和带x关闭按钮的error提示信息
      item.setAttribute('addClickFlag', '1'); // 保证只添加一次事件
      item.addEventListener(
        'click',
        () => {
          // 移除校验信息，如果是item.remove，第二次校验就会有问题
          this.$refs.form.clearValidate(rule.fullField);
          // 这里用完记得移除
          item.removeAttribute('addClickFlag');
          // firstElementChild是第一个子元素。让input获得焦点
          brother.firstElementChild.focus();
        },
        { capture: true, once: true } // 捕获时就执行，once表示执行一次后立即移除事件监听
      );
    }
  });
} */
