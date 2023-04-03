<template>
  <div>
    <!-- 靠上半部的左侧的新增按钮，右侧的搜索栏。转发HandleArea的addBtnEvent和searBtnEvent事件 -->
    <HandleArea :handle-area="handleArea" @addItem="$emit('addItem')" @searItem="$emit('searItem', $event)" />
    <!-- 中间展示区域 -->
    <slot />
    <!-- 表格下方的分页  -->
    <el-pagination
      v-if="pagination"
      style="float: right;margin: 10px"
      :current-page="pagination.page"
      :page-size="pagination.size"
      :page-sizes="[10, 20, 30, 40, 50]"
      layout="total, sizes, prev, pager, next"
      :total="pagination.total"
      @size-change="sizeChangeFun"
      @current-change="currChangeFun"
    />
  </div>
</template>

<script>
import HandleArea from '@/views/common/components/HandleArea.vue';
export default {
  name: 'ContentTemplate',
  components: { HandleArea },
  props: {
    handleArea: { type: Object, required: false },
    pagination: {
      type: Object,
      required: false,
      // 自定义校验器，如果验证不通过，控制台会报错
      validator: function(value) {
        // 可以不用传pagination，但你传了就会验证pagination是否有那三个字段
        if (value) {
          return (
            //  不要使用value.hasOwnProperty(xxx)，得从Object.prototype上使用hasOwnProperty
            Object.prototype.hasOwnProperty.call(value, 'page') &&
            Object.prototype.hasOwnProperty.call(value, 'size') &&
            Object.prototype.hasOwnProperty.call(value, 'total')
          );
        }
        return true;
      }
    }
  },
  beforeDestroy() {
    this.$off(); // 一键解绑所有事件
  },
  methods: {
    // 本组件的分页组件page变了，告诉外界最新的pagination
    currChangeFun(page) {
      const { size, total } = this.pagination;
      const pagination = { page, size, total };
      this.$emit('update:pagination', pagination); // 如果外面的:pagination没有用.sync修饰符，那这条就失效了
      this.$emit('paginationChange', pagination); // 所以这个也要传pagination，以防万一。
    },
    // 本组件的分页组件size变了，告诉外界最新的pagination
    sizeChangeFun(size) {
      const { page, total } = this.pagination;
      const pagination = { page, size, total };
      this.$emit('update:pagination', pagination); // 如果外面的:pagination没有用.sync修饰符，那这条就失效了
      this.$emit('paginationChange', pagination); // 所以这个也要传pagination，以防万一。
    }
  }
};
</script>

<style lang="scss" scoped></style>
