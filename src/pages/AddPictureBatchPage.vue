<template>
  <div id="addPictureBatchPage">
    <h2 style="margin-bottom: 16px">批量创建</h2>
    <!--      上传图片组件-->
    <!--    图片信息表单-->
    <a-form  name="formData" layout="vertical" :model="formData" @finish="handleSubmit">
      <a-form-item name="searchText" label="关键词">
        <a-input v-model:value="formData.searchText" placeholder="请输入关键词" allow-clear />
      </a-form-item>
      <a-form-item name="count" label="数量">
        <a-input-number
          v-model:value="formData.count"
          placeholder="请输入数量"
          :min="1"
          :max="30"
          allow-clear
          style="min-width: 180px"
        />
      </a-form-item>
      <a-form-item name="namePrefix" label="名称前缀">
        <a-auto-complete
          v-model:value="formData.namePrefix"
          placeholder="请输入名称前缀 自动补充序号"
          allow-clear
        />
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading">执行任务</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import PictureUpload from '@/components/PictureUpload.vue'
import { message } from 'ant-design-vue'
import {
  editPictureUsingPost,
  getPictureByIdUsingGet,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet, uploadPictureByBatchUsingPost
} from '@/api/pictureController'
import { useRoute, useRouter } from 'vue-router'
import { id } from 'postcss-selector-parser'
import UrlPictureUpload from '@/components/UrlPictureUpload.vue'



const formData = reactive<API.PictureUploadByBatchRequest>({
  count: 10
})

const loading = ref(false)

const router = useRouter()
const route = useRoute()


/**
 * 表单提交
 * @param values
 */
const handleSubmit = async (values: any) => {
  loading.value = true
  const res = await uploadPictureByBatchUsingPost({
    ...formData
  })
  if (res.data.code === 0 && res.data.data) {
    message.success(`创建成功,共 ${res.data.data} 条`)
    //跳转到主页
    router.push({
      path: `/`
    })
  } else {
    message.error('创建失败' + res.data.msg)
  }
  loading.value = false
}

</script>
<style scoped>
#addPictureBatchPage {
  margin: 0 auto;
  max-width: 720px;
}
</style>
