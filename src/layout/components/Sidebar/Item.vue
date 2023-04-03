<script>
/**
 * MenuItem使用了functional: true，将其定义为函数式组件，它只是一个函数，渲染开销会低很多。
 * 它无状态（没有响应式数据），也没有实例（没有this上下文）
 *
  */
export default {
  name: 'MenuItem',
  functional: true,
  props: {
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },
  // 为了弥补缺少的实例，提供第二个参数作为上下文
  render(h, context) {
    // 上面props里的icon和title
    const { icon, title } = context.props;
    const vnodes = [];

    if (icon) {
      if (icon.includes('el-icon')) {
        vnodes.push(<i class={[icon, 'sub-el-icon']} />);
      } else {
        vnodes.push(<svg-icon icon-class={icon} />);
      }
    }

    if (title) {
      vnodes.push(<span slot='title'>{title}</span>);
    }
    // 直接返回jsx也可以，它会由vue编译成虚拟dom
    return vnodes;
  }
};
</script>

<style scoped>
.sub-el-icon {
  color: currentColor;
  width: 1em;
  height: 1em;
}
</style>
