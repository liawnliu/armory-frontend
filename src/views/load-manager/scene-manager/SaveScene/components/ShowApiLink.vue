<template>
  <div>
    <h3 style="color: #73879c; font-weight: 500; text-align: center">【{{ apiLink.label }}】信息</h3>
    <el-table :data="apiLink.children" style="width: 100%" border stripe>
      <!-- align对齐方式，label列名 -->
      <el-table-column align="center" label="接口ID" width="100" prop="id" />
      <el-table-column align="center" label="接口名称" prop="apiName" />
      <el-table-column align="center" label="接口备注" prop="remark" />
      <el-table-column align="center" label="URL" width="220" prop="apiUrl" />
      <el-table-column align="center" label="维护人" width="100" prop="devUsers" />
      <el-table-column align="center" label="创建人" width="100" prop="name" />
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'ShowApiLink',
  props: { apiLink: { type: Object, required: true, default: () => {} }}
};
</script>

<style lang='scss' scoped></style>
