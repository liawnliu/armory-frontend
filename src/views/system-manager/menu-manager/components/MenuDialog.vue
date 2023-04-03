<template>
  <el-dialog
    :visible.sync="dialogVisible" :title="title"
    width="600px" top="20px"
    :close-on-click-modal="false"
    @close="dialogClose"
  >
    <el-form
      ref="form" :model="menu"
      :rules="rules" label-width="100px"
      label-position="right"
    >
      <el-form-item prop="type" label="资源类型">
        <el-radio-group v-model="menu.type">
          <el-radio :label="0">目录</el-radio>
          <el-radio :label="1">资源</el-radio>
          <el-radio :label="2">按钮</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item prop="parentName" label="上级资源">
        <el-input v-model="menu.parentName" @click.native="selectMenu" />
      </el-form-item>
      <el-form-item prop="label" label="资源名称"><el-input v-model="menu.label" /></el-form-item>
      <el-form-item v-if="menu.type!==2" prop="name" label="路由名称"><el-input v-model="menu.name" /></el-form-item>
      <el-form-item v-if="menu.type!==2" prop="path" label="路由地址"><el-input v-model="menu.path" /></el-form-item>
      <el-form-item v-if="menu.type!==2" prop="url" label="组件路径"><el-input v-model="menu.url" /></el-form-item>
      <el-form-item prop="code" label="权限字段"><el-input v-model="menu.code" /></el-form-item>
      <el-form-item label="资源序号"><el-input v-model="menu.orderNum" /></el-form-item>
      <el-form-item v-if="menu.type!==2" label="显示在侧边栏">
        <el-radio-group v-model="menu.showInSidebar" prop="showInSidebar">
          <el-radio border :label="true">是</el-radio>
          <el-radio border :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-if="menu.name&&menu.label&&menu.type==1&&menu.breadCrumb" prop="breadCrumb" label="面包屑">
        <transition>
          <div v-show="!editBreadCrumb" class="breadCrumb">
            <el-input v-model="breadCrumbStr" type="textarea" autosize disabled />
            <el-button
              class="breadCrumb-edit-btn" size="mini"
              type="primary" icon="el-icon-edit"
              title="编辑" @click="toEditBreadCrumb"
            />
          <!-- <div v-for="(item,index) in menu.breadCrumb" :key="item.name" class="breadCrumb-item">
            <span>{{ `${item.label}` }}</span>
            <span v-if="index < menu.breadCrumb.length-1" style="margin: 0 5px">/</span>
            <el-button v-else size="mini" type="primary" icon="el-icon-edit" title="编辑" />
          </div> -->
          </div>
        </transition>
        <transition>
          <el-table v-show="editBreadCrumb" class="breadCrumb-table" :data="breadCrumbCopy" size="mini" border stripe>
            <el-table-column align="center" label="面包项" prop="label" />
            <el-table-column align="center" label="操作" min-width="50">
              <template slot-scope="{$index}">
                <el-button
                  v-if="$index!==breadCrumbCopy.length-1"
                  icon="el-icon-plus" type="primary"
                  size="mini" @click="addBreadCrumb($index)"
                />
                <el-button
                  v-if="$index!==0 && $index!==breadCrumbCopy.length-1"
                  icon="el-icon-minus" type="danger"
                  size="mini" @click="deleteBreadCrumb($index)"
                />
                <el-button
                  v-if="$index===breadCrumbCopy.length-1" type="success"
                  size="mini"
                  @click="saveBreadCrumb"
                >保存所有项</el-button>
                <el-button
                  v-if="$index===breadCrumbCopy.length-1" type="warning"
                  size="mini"
                  @click="cancelSaveBreadCrumb"
                >取消编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </transition>
      </el-form-item>
    </el-form>
    <div style="text-align: right;margin-top: 20px">
      <el-button type="primary" @click="saveMenu">保存</el-button>
      <el-button type="danger" @click="dialogVisible = false">关闭</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { menuDialogEvent, listTreeDialogEvent } from '@/config/event.js';
import { saveMenu, getParMenuList } from '@/api/system-manager';
import { toValidate } from '@/utils/validate';
export default {
  name: 'MenuDialog',
  data() {
    // 面包屑可以为空，但是一旦填了就必须是JSON形式的
    const checkBreadCrumb = (rule, value, callback) => {
      if (!value || !value.length) {
        return callback(new Error('请设置面包屑'));
      }
      if (value.length < 2) {
        return callback(new Error('面包屑里应至少有两项'));
      }
      if (value[0].name !== 'Home') {
        return callback(new Error('面包屑里的第一项应是“主页”'));
      }
      if (value[value.length - 1].name !== this.menu.name) {
        return callback(new Error('面包屑里的第一项应是“自身”'));
      }
      callback();
    };
    return {
      editBreadCrumb: false, // 是否正在编辑面包屑
      breadCrumbCopy: [], // 复制breadCrumb，用于编辑面包屑
      breadCrumbStr: '', // 面包屑编辑完后的展示效果
      dataList: [], // 选好父节点后，会将父节点到顶级节点的数据存储到dataList
      menu: { name: '', label: '', type: 1, parentId: -1, parentName: '', showInSidebar: true, breadCrumb: [] },
      dialogType: 'add',
      dialogVisible: false,
      rules: {
        type: [{ required: true, trigger: 'change', message: '请选择资源类型' }],
        parentName: [{ required: true, trigger: 'change', message: '请填写上级资源' }],
        label: [{ required: true, trigger: 'blur', message: '请填写资源名称' }],
        name: [{ required: true, trigger: 'blur', message: '请填写路由名称' }],
        path: [{ required: true, trigger: 'blur', message: '请填写路由地址' }],
        url: [{ required: true, trigger: 'blur', message: '请填写组件路径' }],
        code: [{ required: true, trigger: 'blur', message: '请填写权限字段' }],
        breadCrumb: [{ required: true, trigger: 'blur', validator: checkBreadCrumb }]
      }
    };
  },
  computed: {
    title() {
      return this.dialogType === 'edit' ? '更新资源' : '新增资源';
    }
  },
  watch: {
    // 获取breadCrumbStr的值，它主要是面包屑的预览
    'menu.breadCrumb': {
      handler(val) {
        if (!val || !val.length) {
          this.breadCrumbStr = '';
          return;
        }
        let str = val[0].label;
        val.forEach((item, index) => {
          if (index !== 0) {
            str = `${str} / ${item.label}`;
          }
        });
        this.breadCrumbStr = str;
      }
    }
  },
  created() {
    /*
      breadCrumb面包屑，在当前menu的type为1并且name和lable都填写了，才让面包屑编辑组件出现，否则
      清空breadCrumb相关数据
    */
    this.$watch(
      () => [this.menu.name, this.menu.label, this.menu.type, this.dataList],
      val => {
        console.log('MenuDialog $watch val', val);
        if (val[0] && val[1] && val[2] === 1 && val[3].length) {
          // 先清空
          this.menu.breadCrumb = [];
          // 第一项是主页
          this.menu.breadCrumb[0] = { name: 'Home', label: 'Armory' };
          // 中间项是选择父项时拿到的数据
          this.dataList.forEach(item => {
            this.menu.breadCrumb.push({
              name: item.name,
              label: item.label,
              type: item.type
            });
          });
          // 最后一项是自身
          this.menu.breadCrumb.push({
            name: val[0],
            label: val[1],
            type: val[2]
          });
          console.log('MenuDialog $watch breadCrumb', this.menu.breadCrumb);
          // 更新breadCrumbStr
          let str = this.menu.breadCrumb[0].label;
          this.menu.breadCrumb.forEach((item, index) => {
            if (index !== 0) {
              str = `${str} / ${item.label}`;
            }
          });
          this.breadCrumbStr = str;
        }
      },
      {
        immediate: true,
        deep: true
      }
    );
  },
  mounted() {
    this.$bus.$on(menuDialogEvent, this.showOrHide);
  },
  beforeDestroy() {
    this.$bus.$off(menuDialogEvent);
  },
  inject: ['getMenuList'],
  methods: {
    clearBreadCrumb() {
      this.menu.breadCrumb = [];
      this.breadCrumbCopy = [];
      this.breadCrumbStr = '';
      this.editBreadCrumb = false;
      this.dataList = [];
    },
    dialogClose() {
      this.$refs.form.clearValidate(); // 关闭时清空校验信息
      this.menu = { name: '', label: '', type: 1, parentId: -1, parentName: '', showInSidebar: true };
      this.clearBreadCrumb();
    },
    showOrHide({ menu, dialogType }) {
      console.log('showOrHide menu', menu);
      this.dialogVisible = true;
      dialogType != null && (this.dialogType = dialogType);
      (menu != null) && (
        this.menu = {
          ...this.menu,
          ...menu,
          breadCrumb: menu.breadCrumb ? JSON.parse(menu.breadCrumb) : [] }
      );
      // 解析出dataList
      if (this.menu.breadCrumb.length) {
        this.dataList = this.menu.breadCrumb.filter((item, index) => {
          return (index !== 0 && index !== this.menu.breadCrumb.length - 1);
        });
      }
    },
    async saveMenu() {
      try {
        if (this.editBreadCrumb) {
          this.$message({ type: 'error', message: '请先保存面包屑' });
          return;
        }
        const validateRlt = await toValidate(this.$refs.form); // 校验表单
        if (!validateRlt) return false; // 校验没通过
        const params = {
          ...this.menu,
          breadCrumb: this.menu.type === 1 ? JSON.stringify(this.menu.breadCrumb) : null,
          breadCrumbStr: null,
          breadCrumbCopy: null,
          dataList: null,
          editBreadCrumb: null
        };
        await saveMenu(params);
        this.$message({ type: 'success', message: `${this.title}成功！` });
        this.dialogVisible = false;
        this.getMenuList();
        // 更新当前登录用户的资源信息（可访问路由和左侧菜单列表）
        await this.$store.dispatch('user/updateUserAndResource', 'resource');
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    updateParMenu({ data, dataList }) {
      console.log('updateParMenu data', data);
      console.log('updateParMenu dataList', dataList);
      this.menu.parentId = data.id;
      this.menu.parentName = data.label; // 按理说应该是parentLabel，没办法服务端取的这个名称
      // 只留name、label、type
      if (dataList && dataList.length) {
        this.dataList = dataList.map(item => {
          return { name: item.name, label: item.label, type: item.type };
        });
      }
      this.$refs.form.clearValidate('parentName');
    },
    async selectMenu() {
      try {
        const { content } = await getParMenuList();
        if (!content || !content.length) {
          this.$message({ type: 'warning', message: '上级资源列表为空！' });
          return;
        }
        // 打开'选择上级资源'的弹窗
        this.$bus.$emit(listTreeDialogEvent, {
          dialogTitle: '选择上级资源',
          list: content,
          updateData: this.updateParMenu,
          banId: [this.menu.id] // 自己不能作为自己的上级资源
        });
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    async selectBreadCrumb() {
      try {
        const { content } = await getParMenuList();
        if (!content || !content.length) {
          this.$message({ type: 'warning', message: '资源列表为空！' });
          return;
        }
        // 打开'选择上级资源'的弹窗
        this.$bus.$emit(listTreeDialogEvent, {
          dialogTitle: '选择面包项',
          list: content,
          updateData: this.addBreadCrumbCall,
          banId: ['0', this.menu.id] // 自己不能再被选，顶级的也不能选
        });
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      }
    },
    // 去编辑面包屑
    toEditBreadCrumb() {
      // 复制一份，不要让编辑时的修改影响到this.menu.breadCrumb，只有真的保存了才同步到this.menu.breadCrumb
      this.breadCrumbCopy = [...this.menu.breadCrumb];
      this.editBreadCrumb = true;
    },
    // 保存所有面包项，将this.breadCrumbCopy同步到this.menu.breadCrumb
    saveBreadCrumb() {
      this.menu.breadCrumb = [...this.breadCrumbCopy];
      this.editBreadCrumb = false;
    },
    // 取消保存，将this.breadCrumbCopy置空，this.menu.breadCrumb就不用变了
    cancelSaveBreadCrumb() {
      this.breadCrumbCopy = [];
      this.editBreadCrumb = false;
    },
    // 添加新面包项，需要从menuList里选择
    addBreadCrumb(index) {
      this.editBreadCrumbCurrIndex = index;
      // 打开弹框选择，选好后会调用this.addBreadCrumbCall
      this.selectBreadCrumb();
    },
    // 添加新面包项的回调，往breadCrumbCopy里添加，记住不要直接往this.menu.breadCrumb里添加了
    addBreadCrumbCall({ data }) {
      console.log('addBreadCrumbCall data', data);
      const { name, label, level } = data;
      this.breadCrumbCopy.splice(this.editBreadCrumbCurrIndex + 1, 0, { name, label, level });
    },
    // 从breadCrumbCopy里删除一项
    deleteBreadCrumb(index) {
      console.log('deleteBreadCrumb index', index);
      this.breadCrumbCopy.splice(index, 1);
    }
  }
};
</script>

<style lang='scss' scoped>
.breadCrumb {
  position: relative;
  .el-textarea.is-disabled {
    ::v-deep {
      .el-textarea__inner {
        /* 2%是按钮的right，10px是按钮的内边距，12px是按钮的内部大小，15px是与左边距相匹配 */
        padding-right: calc(3% + 10px + 12px + 15px);
        background-color: unset;
        color: #303133;
        cursor: unset;
      }
    }
  }
  .breadCrumb-edit-btn {
    position: absolute;
    padding: 5px;
    right: 3%;
    top: calc(50% - 9px);
  }
}

.breadCrumb-table {
  display: inline-block;
  ::v-deep {
    .el-table__header {
      height: 20px;
      line-height: 20px;
    }
    /* 表里的操作按钮 */
    .el-button {
      font-size: 10px;
      padding: 5px;
    }
  }
}
/* 过渡信息写在这两个类名里 */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.7s linear;
}
/* 进入过程的开始状态就是0，并且离开过程的结束状态也是0 */
.v-enter,
.v-leave-to {
  opacity: 0;
}
/* 进入过程的结束状态就是1，并且离开过程的开始状态也是1 */
.v-enter-to,
.v-leave {
  opacity: 1;
}
</style>
