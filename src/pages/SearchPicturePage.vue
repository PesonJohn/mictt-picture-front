<template>
  <div id="searchPicturePage">
    <h2 style="margin-bottom: 16px">以图搜图</h2>
    <h3 style="margin-bottom: 16px">原图</h3>
    <!--            单张图片-->
    <a-card hoverable style="width: 240px">
      <template #cover>
        <img
          :alt="picture.name"
          :src="picture.thumbnailUrl ?? picture.url"
          style="height: 180px; object-fit: cover"
        />
      </template>
    </a-card>
    <h3 style="margin: 16px 0">识图结果</h3>
    <!--    图片结果列表-->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <a :href="picture.fromUrl" target="_blank">
            <!--            单张图片-->
            <a-card hoverable>
              <template #cover>
                <img
                  :alt="picture.name"
                  :src="picture.thumbUrl ?? picture.url"
                  style="height: 180px; object-fit: cover"
                />
              </template>
            </a-card>
          </a>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getPictureVoByIdUsingGet, searchPictureByPictureUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { DeleteOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons-vue'

const route = useRoute()

const picture = ref<API.PictureVo>({})
const pictureId = computed(() => {
  return route.query?.pictureId
})
const loading = ref<boolean>(false)

//获取图片信息
const fetchPictureDetail = async () => {
  loading.value = true
  try {
    const res = await getPictureVoByIdUsingGet({
      id: pictureId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('获取图片信息失败 ' + res.data.msg)
    }
  } catch (e) {
    message.error('获取图片信息失败 ' + e.message)
  }
  loading.value = false
}

//页面加载时获取数据 请求一次
onMounted(() => {
  fetchPictureDetail()
  fetchResultData()
})

//以图搜图结果列表
const dataList = ref<API.ImageSearchResult[]>([])

//获取搜图结果
const fetchResultData = async () => {
  try {
    const res = await searchPictureByPictureUsingPost({
      pictureId: pictureId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data ?? []
    } else {
      message.error('获取数据失败 ' + res.data.msg)
    }
  } catch (e) {
    message.error('获取数据失败 ' + e.message)
  }
}
</script>
<style scoped>
#searchPicturePage {
}
</style>
