<template>
  <div id="pictureDetailPage">
<!--   gutter="[16,16]表示横纵之间的间距 -->
    <a-row :gutter="[16, 16]">
      <!-- 图片展示区 -->
      <a-col :sm="24" :md="16" :xl="18">
        <a-card title="图片预览">
          <a-image
            style="max-height: 600px; object-fit: contain"
            :src="picture.url"
          />
        </a-card>
      </a-col>
      <!-- 图片信息区 -->
      <a-col :sm="24" :md="8" :xl="6">
        <a-card title="图片信息">
          <a-descriptions :column="1">
            <a-descriptions-item label="作者">
              <a-space>
                <a-avatar :size="24" :src="picture.user?.userAvatar" />
                <div>{{ picture.user?.userName }}</div>
              </a-space>
            </a-descriptions-item>
            <a-descriptions-item label="名称">
              {{ picture.name ?? '未命名' }}
            </a-descriptions-item>
            <a-descriptions-item label="简介">
              {{ picture.introduction ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="分类">
              {{ picture.category ?? '默认' }}
            </a-descriptions-item>
            <a-descriptions-item label="标签">
              <a-tag v-for="tag in picture.tags" :key="tag">
                {{ tag }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="格式">
              {{ picture.picFormat ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽度">
              {{ picture.picWidth ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="高度">
              {{ picture.picHeight ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="宽高比">
              {{ picture.picScale ?? '-' }}
            </a-descriptions-item>
            <a-descriptions-item label="大小">
              {{ formatSize(picture.picSize) }}
            </a-descriptions-item>
          </a-descriptions>
<!--          图片操作-->
          <a-space wrap>
            <a-button v-if="canDownload" type="primary" @click="doDownload">
              免费下载
              <template #icon>
                <DownloadOutlined />
              </template>
            </a-button>
            <a-button v-if="canEdit" :icon="h(EditOutlined)"  type="default" @click="doEdit" target="_blank">编辑</a-button>
            <a-button v-if="canEdit" :icon="h(DeleteOutlined)" @click="doDelete" danger>删除</a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h } from 'vue'
import {
  deletePictureUsingPost,
  getPictureVoByIdUsingGet,
  listPictureByPageUsingPost,
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { downloadImage, formatSize } from '@/utils'
import {EditOutlined,DeleteOutlined,DownloadOutlined} from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

interface Props{
  id: number | string
}

const props = defineProps<Props>()

const router = useRouter()



//搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

const loginUserStore = useLoginUserStore()

// 判断是否可以编辑
const canEdit = computed(() =>{
  const loginUser = loginUserStore.loginUser
  //未登录不能编辑
  if (!loginUser.id){
    return false
  }
  //本人或管理员才能编辑
  const user = picture.value.user || {}
  return  loginUser.id === user.id || loginUser.userRole === 'admin'
})

const canDownload = computed(() =>{
  const loginUser = loginUserStore.loginUser
  //未登录不能编辑
  return loginUser.id;

})

const doDelete = async () => {
  const id = picture.value.id
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')

  } else {
    message.error('删除失败')
  }
}

const doEdit = () =>{
  router.push('/add_picture?id=' + picture.value.id)
}

const doDownload = () => {
  downloadImage(picture.value.url)
}

const picture = ref<API.PictureVo>({})

//获取图片信息
const fetchPictureDetail = async () =>{
  try {
    const res = await getPictureVoByIdUsingGet({id: props.id})
    if (res.data.code === 0 && res.data.data){
      picture.value = res.data.data
    }else {
      message.error('获取图片信息失败 ' + res.data.msg)
    }
  }catch (e) {
    message.error('获取图片信息失败 ' + e.message)
  }

}

//页面加载时获取数据 请求一次
onMounted(() => {
  fetchPictureDetail()
})


</script>
<style scoped>
#pictureDetailPage {

}


</style>
