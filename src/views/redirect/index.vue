<script>
export default {
  created() {
    const { params, query } = this.$route;
    const { path } = params;
    // 帮你重定向回path页面
    this.$router.replace({ path: '/' + path, query });
  },
  render: function(h) {
    return h(); // avoid warning message
  }
};
</script>
