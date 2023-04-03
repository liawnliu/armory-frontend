import store from '@/store';

/*
  https://www.cnblogs.com/runrunrun/p/11639053.html
  不用v-show是因为它只设置了display: none，这样对于权限的按钮非常不安全，不用v-if是因为它遗留了注释节点<!---->。
  还有一个原因，用v-show或v-if做权限控制，那么每个需要控制的地方都要引入某个公共方法来进行权限的判断。
  而自定义指令只需要加在按钮上并且传入权限值，就可以帮你判断并处理按钮隐藏显示，无需v-if/v-show那么繁琐。
  优点是语义明了（一看就知道是控制权限的）并且不遗留其他东西，不用额外import公共方法；
  缺点是先把按钮渲染出来，再根据权限值来决定是否从真实DOM上移除它
 */
function checkAuth(el, binding) {
  const { value } = binding;
  const auth = store.getters && store.getters.auth;

  if (value && value instanceof Array && value.length) {
    if (value.length > 0) {
      const permission = value;

      const hasPermission = auth.some(code => {
        return permission.includes(code);
      });

      if (!hasPermission) {
        console.log('checkAuth hasPermission', value);
        el.parentNode && el.parentNode.removeChild(el);
      }
    }
  } else {
    throw new Error(`need auth! Like v-btn-auth="['admin','editor']"`);
  }
}
/*
  自定义指令几个钩子
  bind：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
  inserted：被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。
  update：所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。
          指令的值可能发生了改变，也可能没有。但是你可以通过比较更新前后的值来忽略不必要的模板更新
  componentUpdated: 被绑定元素所在模板完成一次更新周期时调用。
  unbind：当指令销毁时也把方法销毁

  钩子的入参
  el：指令所绑定的元素，可以用来直接操作 DOM。
  binding：一个对象，包含name（指令名）、value（绑定值）、oldValue（旧绑定值）、expression（字符串形式的绑定值）、
  arg（传给指令的参数）、modifiers（修饰符对象）属性。
*/
export default {
  inserted(el, binding) {
    checkAuth(el, binding);
  }
};
