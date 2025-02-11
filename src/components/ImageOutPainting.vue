<template>
  <a-modal
    class="image-out-painting"
    v-model:open="visible"
    title="AI 扩图"
    :footer="false"
    @cancel="closeModal"
  >
    <a-row gutter="16">
      <a-col span="12">
        <h4>原始图片</h4>
        <img :src="picture?.url" :alt="picture?.name" style="max-width: 100%" />
      </a-col>
      <a-col span="12">
        <h4>扩图结果</h4>
        <img v-if="resultImageUrl" :src="resultImageUrl" :alt="picture?.name" style="max-width: 100%" />
      </a-col>
    </a-row>
    <div style="margin-bottom: 16px" />
    <a-flex justify="center" gap="16">
      <a-button type="primary" :loading="!!taskId" @click="createTask" ghost>生成图片</a-button>
      <a-button v-if="resultImageUrl" type="primary" :loading="uploading" @click="handleUpload">应用结果</a-button>
    </a-flex>
  </a-modal>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  createPictureOutPaintingTaskUsingPost,
  getPictureOutPaintingTaskUsingGet, uploadPictureByUrlUsingPost,
  uploadPictureUsingPost
} from '@/api/pictureController'
import { message } from 'ant-design-vue'

interface Props {
  picture?: API.PictureVo
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVo) => void
}

const props = defineProps<Props>()

const resultImageUrl = ref<string>('')

// 编辑器组件的引用
const cropperRef = ref()

//任务id
const taskId = ref<string>()

/**
 * 创建任务
 */
const createTask = async () => {
  if (!props.picture?.id) {
    return
  }
  const res = await createPictureOutPaintingTaskUsingPost({
    pictureId: props.picture.id,
    //根据需要设置扩图参数
    parameters: {
      xScale: 2,
      yScale: 2
    }
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('创建任务成功，耐心等待，请不要退出')
    console.log(res.data.data.output?.taskId)//打印任务ID
    taskId.value = res.data.data.output?.taskId
    //开启轮询
    startPolling()
  } else {
    message.error('创建任务失败，' + res.data.msg)
  }
}

//轮询定时器
let pollingTimer: NodeJs.Timeout = null

const startPolling = () => {
  if (!taskId.value){
    return
  }
  pollingTimer = setInterval(async () => {
    try {
      const res = await getPictureOutPaintingTaskUsingGet({
        taskId: taskId.value
      })
      if (res.data.code === 0 && res.data.data) {
        const taskResult = res.data.data.output
        if (taskResult?.taskStatus === 'SUCCEEDED'){
          message.success('扩图任务执行成功')
          resultImageUrl.value = taskResult?.outputImageUrl
          clearPolling()
        }else if (taskResult?.taskStatus === 'FAILED'){
          message.error('扩图任务执行失败')
          clearPolling()
        }

      }
    }catch (error){
      console.log('扩图任务轮询失败',error)
      message.error('检测任务失败 请稍后重试')
      clearPolling()
    }
  }, 3000)//每3s轮询一次
}

//清理轮询
const clearPolling = () => {
  if (pollingTimer){
    clearInterval(pollingTimer)
    pollingTimer = null
    //允许前端多次执行任务
    taskId.value = null
  }
}

onMounted(() =>{
  clearPolling()
})

const uploading = ref(false)

/**
 * 上传图片
 *
 */
const handleUpload = async () => {
  uploading.value = true
  try {
    const params: API.PictureUploadRequest = {
      fileUrl: resultImageUrl.value,
      spaceId: props.spaceId
    }
    if (props.picture) {
      params.id = props.picture.id
    }
    const res = await uploadPictureByUrlUsingPost(params)
    if (res.data.code === 0 && res.data.data) {
      message.success('上传成功')
      //将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
      closeModal()
    } else {
      message.error('上传失败' + res.data.msg)
    }
  } catch (e) {
    console.error('上传失败', e)
    message.error('上传失败 ' + e.message)
  } finally {
    uploading.value = false
  }
}

const visible = ref<boolean>(false)

const openModal = () => {
  visible.value = true
}

const closeModal = () => {
  visible.value = false
}

//暴露函数给父组件
defineExpose({
  openModal
})
</script>

<style>
.image-out-painting {
  text-align: center;
}
</style>
