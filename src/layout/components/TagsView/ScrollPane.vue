<template>
  <el-scrollbar ref="scrollContainer" :vertical="false" class="scroll-container" @wheel.native.prevent="handleScroll">
    <slot />
  </el-scrollbar>
</template>

<script>
const tagAndTagSpacing = 4; // tagAndTagSpacing

export default {
  name: 'ScrollPane',
  data() {
    return {
      left: 0
    };
  },
  computed: {
    scrollWrapper() {
      return this.$refs.scrollContainer.$refs.wrap;
    }
  },
  mounted() {
    this.scrollWrapper.addEventListener('scroll', this.emitScroll, true);
  },
  beforeDestroy() {
    this.scrollWrapper.removeEventListener('scroll', this.emitScroll);
  },
  methods: {
    // 处理el-scrollbar的滚动
    handleScroll(e) {
      // 使用wheelDelta和deltaY是浏览器兼容问题。负数和乘以40是因为：wheelDelta的值是120的倍数，deltaY是-3的倍数，他俩之间相差40
      const eventDelta = e.wheelDelta || -e.deltaY * 40;
      const $scrollWrapper = this.scrollWrapper;
      // 在原基础上加上eventDelta / 4，除以几看你的预期滚动幅度
      $scrollWrapper.scrollLeft = $scrollWrapper.scrollLeft + eventDelta / 4;
    },
    emitScroll() {
      this.$emit('scroll');
    },
    moveToTarget(currentTag) {
      // el-scrollbar的真实元素
      const $container = this.$refs.scrollContainer.$el;
      // 获取它的宽度
      const $containerWidth = $container.offsetWidth;
      // 获取它的滚动区域元素
      const $scrollWrapper = this.scrollWrapper;
      // 从父级组件里拿到tag组件
      const tagList = this.$parent.$refs.tag;

      let firstTag = null; // 第一个tag
      let lastTag = null; // 最后一个tag

      if (tagList.length > 0) {
        firstTag = tagList[0];
        lastTag = tagList[tagList.length - 1];
      }
      // 如果是移动到第一个tag，就让scrollLeft为0
      if (firstTag === currentTag) {
        $scrollWrapper.scrollLeft = 0;
      } else if (lastTag === currentTag) {
      // 如果是移动到最后一个tag，就让scrollLeft为：内容宽度减去容器宽度。也就是最大滚动量
        $scrollWrapper.scrollLeft = $scrollWrapper.scrollWidth - $containerWidth;
      } else {
        // 在tagList中找到当前tag的index，自然就可以拿到它前一个和后一个的tag
        const currentIndex = tagList.findIndex(item => item === currentTag);
        // 获取前一个和后一个的tag的原因是，滚动到当前tag时确保前后的tag也能显示在scroll容器，至少是右边重合或者左边重合
        const prevTag = tagList[currentIndex - 1];
        const nextTag = tagList[currentIndex + 1];

        // 右边：后一个的tag的左边界加上tag的宽度以及间隙4（这个距离值是相对于scroll容器左边界来说的）
        const afterNextTagOffsetLeft = nextTag.$el.offsetLeft + nextTag.$el.offsetWidth + tagAndTagSpacing;
        // 左边：前一个的tag的左边界减去间隙4（这个距离值是相对于scroll容器左边界来说的）
        const beforePrevTagOffsetLeft = prevTag.$el.offsetLeft - tagAndTagSpacing;

        // 如果afterNextTagOffsetLeft（右边），超出scroll容器右边界，也就是不可见了，那么修正滚动条，让它们的右边重合
        if (afterNextTagOffsetLeft > $scrollWrapper.scrollLeft + $containerWidth) {
          $scrollWrapper.scrollLeft = afterNextTagOffsetLeft - $containerWidth;
        } else if (beforePrevTagOffsetLeft < $scrollWrapper.scrollLeft) {
          // 如果beforePrevTagOffsetLeft（左边），超出scroll容器左边界（这里就不用加$containerWidth了，右边界就要加），
          // 也就是不可见了，那么修正滚动条，让它们的左边重合
          $scrollWrapper.scrollLeft = beforePrevTagOffsetLeft;
        }
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.scroll-container {
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  width: 100%;
  ::v-deep {
    .el-scrollbar__bar {
      bottom: 0px;
    }
    .el-scrollbar__wrap {
      height: 49px;
    }
  }
}
</style>
