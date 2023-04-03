<template>
  <div>
    <h3 style="color: #73879c; font-weight: 500; text-align: center">【{{ form.sceneName }}】基础信息</h3>
    <el-form
      ref="form" :model="form"
      :rules="rules" label-width="90px"
      label-position="right" style="margin-right: 20px;"
    >
      <el-form-item label="场景名称" prop="sceneName">
        <el-input v-model.lazy="form.sceneName" />
      </el-form-item>
      <el-form-item label="场景类型" prop="sceneType">
        <el-select v-model="form.sceneType" placeholder="请填写场景类型">
          <el-option label="单接口测试" :value="1" />
          <el-option label="混合接口测试" :value="2" />
        </el-select>
      </el-form-item>
      <!-- 后端暂时没有该功能 -->
      <!-- <el-form-item label="顺序执行" prop="sequence">
        <el-radio-group v-model="form.sequence">
          <el-radio border :label="true">是</el-radio>
          <el-radio border :label="false">否</el-radio>
        </el-radio-group>
      </el-form-item> -->
      <el-form-item label="邮箱地址" prop="email">
        <el-input v-model="form.email" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model.lazy="form.remark" :autosize="{ minRows: 5, maxRows: 10 }" type="textarea" />
      </el-form-item>
    </el-form>
    <el-button
      type="primary"
      round
      style="display: block; width: 120px; margin: 30px auto"
      @click="saveForm"
    >保存</el-button>
  </div>
</template>

<script>
import { saveScene } from '@/api/load-manager';
import { handleSceneId } from '../scripts/handle-data';
import { toValidate } from '@/utils/validate';
export default {
  name: 'SaveSceneBasic',
  props: {
    taskId: {
      required: true,
      type: String,
      default: ''
    },
    scene: {
      required: true,
      type: Object,
      default: () => {}
    },
    updateSceneBasic: {
      required: true,
      type: Function,
      default: () => {}
    }
  },
  data() {
    return {
      rules: {
        sceneName: [{ required: true, trigger: 'blur', message: '请填写场景名称' }],
        sceneType: [{ required: true, trigger: 'blur', message: '请填写场景类型' }]
      },
      form: {
        sceneType: 1
      }
    };
  },
  watch: {
    scene: {
      immediate: true,
      handler(val) {
        console.log('scene val', val);
        if (val.id != null) {
          this.form = { sceneType: 1, ...val };
        } else {
          this.form = { sceneType: 1 };
        }
      }
    }
  },
  methods: {
    async saveForm() {
      console.log('this.scene', this.form);
      try {
        const validateRlt = await toValidate(this.$refs.form); // 校验表单
        if (!validateRlt) return false; // 校验没通过
        // 修改的话要处理一下id
        this.form.id = (this.form.id != null) ? handleSceneId(this.form.id, 1) : null;
        // 调后端接口
        const { content } = await saveScene({ ...this.form, stressId: this.taskId });
        this.$message({ type: 'success', message: '场景基本信息保存成功！' });
        // 重新重服务端获取场景的基本信息
        this.updateSceneBasic(content);
      } catch (error) {
        this.$message({ type: 'error', message: '场景基本信息保存失败！' });
      }
    }
  }
};
</script>

<style lang='scss' scoped></style>
