<template>
  <div class="logincontainer">
    <el-form ref="loginForm" class="loginForm" :model="loginForm" :inline="false" size="normal" :rules="rules">
      <el-form-item>
        <div class="loginTitle">系统登录</div>
      </el-form-item>
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item prop="code">
        <!-- 分栏间隔el-row，默认24分栏，gutter表示每一栏之间的间隔，span表示栅格占据的列数，offset栅格左侧的间隔格数 -->
        <el-row :gutter="20">
          <el-col :span="15" :offset="0">
            <el-input v-model="loginForm.code" placeholder="请输入验证码" />
          </el-col>
          <el-col :span="9" :offset="0" class="imgse-around">
            <img :src="imgSrc" class="imgse" @click="getImage">
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item class="handle-area">
        <el-row>
          <el-col :span="11" :offset="0">
            <el-button class="btn" type="primary" size="normal" @click="handlerLogin">
              <span v-if="!loading">登 录</span>
              <span v-else>登 录 中...</span>
            </el-button>
          </el-col>
          <el-col :span="11" :offset="2">
            <el-button class="btn" type="normal" size="default">取消</el-button>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { getImageApi } from '@/api/user';
import { toValidate } from '@/utils/validate';
export default {
  // 存储数据的地方，页面需要显示的数据，都需要显示的在data里面定义
  // 双向绑定的
  data() {
    return {
      loading: false,
      imgSrc: '',
      // 登录数据域
      loginForm: {
        username: '',
        password: '',
        code: '',
        redirect: undefined,
        otherQuery: {}
      },
      // 表单验证规则
      rules: {
        username: [{ required: true, trigger: 'change', message: '请输入用户名' }],
        password: [{ required: true, trigger: 'change', message: '请输入密码' }],
        code: [{ required: true, trigger: 'change', message: '请输入验证码' }]
      }
    };
  },
  watch: {
    $route: {
      immediate: true,
      handler: function(route) {
        const query = route.query;
        if (query) {
          this.redirect = query.redirect;
          this.otherQuery = this.getOtherQuery(query);
        }
      }
    }
  },
  created() {
    this.getImage();
  },
  methods: {
    // 获取验证码
    async getImage() {
      try {
        this.imgSrc = await getImageApi();
        console.log('this.imgSrc', this.imgSrc);
      } catch (error) {
        this.$message({ type: 'error', message: error.message });
      }
    },
    // 登录提交事件
    async handlerLogin() {
      try {
        await toValidate(this.$refs.loginForm);
        this.loading = true;
        await this.$store.dispatch('user/login', this.loginForm);
        // 如果有?redirect=xxx，那就重定向到xxx，否则去根路径/
        this.$router.push({ path: this.redirect || '/', query: this.otherQuery });
      } catch ({ message }) {
        this.$message({ type: 'error', message });
      } finally {
        this.loading = false;
      }
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur];
        }
        return acc;
      }, {});
    }
  }
};
</script>

<style lang="scss" scoped>
.logincontainer {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url("~@/assets/bg/bg.jpg") center center / cover;
  .loginForm {
    height: 350px;
    width: 450px;
    box-shadow: 0 0 20px #3e3e3e;
    border-radius: 10px;
    padding: 10px 50px;
    background-color: #161616;
    ::v-deep {
      .el-form-item {
        margin-top: 20px;
        margin-bottom: 20px;
      }
      .el-input__inner {
        height: 35px;
        line-height: 35px;
        background-color: #e9e9e9;
        &::placeholder {
          color: rgb(129, 129, 129);
        }
      }
      .el-form-item__error {
        top: 95%
      }
    }
    .loginTitle {
      font-size: 24px;
      font-weight: 600;
      line-height: 35px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff
    }
    .imgse-around {
      /* height: 100%; */
      font-size: 0;
      line-height: 0;
      /* display: flex;
      align-items: center; */
    }
    .imgse {
      /* width: 100%;
      height: 100%; */
    }
    .handle-area {
      margin-top: 30px;
    }
    .btn {
      width: 100%;
    }
  }
}
</style>
