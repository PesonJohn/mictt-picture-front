<template>
  <div class="url-picture-upload">
    <a-input-group compact>
      <a-input
        v-model:value="fileUrl"
        style="width: calc(100% - 120px)"
        placeholder="请输入文件地址"
      />
      <a-button type="primary" style="width: 120px" :loading="loading" @click="handleUpload"
        >上传</a-button
      >
    </a-input-group>
    <div class="img-wrapper">
      <img v-if="picture?.url" :src="picture.url" alt="avatar" />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadChangeParam, UploadProps } from 'ant-design-vue'
import { uploadPictureByUrlUsingPost, uploadPictureUsingPost } from '@/api/pictureController'

interface Props {
  picture?: API.PictureVo
  onSuccess?: (newPicture: API.PictureVo) => void
}

const loading = ref<boolean>(false)

const props = defineProps<Props>()

const fileUrl = ref<string>()

/**
 * 上传图片
 * @param file
 *
 */
const handleUpload = async () => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = { fileUrl: fileUrl.value }
    if (props.picture) {
      params.id = props.picture.id
    }
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      message.success('上传成功')
      //将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
    } else {
      message.error('上传失败' + res.data.msg)
    }
  } catch (e) {
    console.error('上传失败', e)
    message.error('上传失败 ' + e.message)
  } finally {
    loading.value = false
  }
}

/**
 * 上传图片之前校验
 * @param file
 */
const beforeUpload = (file: UploadProps['fileList'][number]) => {
  //校验图片格式
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('不支持的文件类型，推荐jpg或者png')
  }
  //校验图片大小
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('文件大小不能超过2MB!')
  }
  return isJpgOrPng && isLt2M
}
</script>
<style scoped>
.url-picture-upload {
  margin-bottom: 16px;
}

.url-picture-upload img {
  max-width: 100%;
  /*限制图片最大高度*/
  max-height: 480px;
}

.url-picture-upload .img-wrapper{
  text-align: center;
  margin-top: 16px;
}
</style>
