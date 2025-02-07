<template>
  <div id="spaceDetailPage">
    <!--  空间信息-->
    <a-flex justify="space-between">
      <h2>{{ space.spaceName }} (私有空间)</h2>
      <a-space size="middle">
        <a-button type="primary" :href="`/add_picture?spaceId=${id}`" target="_blank"
          >+ 创建图片</a-button
        >
        <a-tooltip
          :title="`占用空间 ${formatSize(space?.totalSize)} / ${formatSize(space?.maxSize)}`"
        >
          <a-progress
            type="circle"
            :size="42"
            :percent="((space?.totalSize / space?.maxSize) * 100).toFixed(1)"
          />
        </a-tooltip>
      </a-space>
    </a-flex>
    <div style="margin-bottom: 16px"/>
<!--    搜索表单-->
    <PictureSearchForm :onSearch="onSearch"/>
    <div style="margin-bottom: 16px"/>
    <!--    图片列表-->
    <PictureList :dataList="dataList" :loading="loading" :show-op="true" :onReload="fetchData"/>
    <!--    分页-->
    <a-pagination
      style="text-align: right"
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      @change="onPageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h } from 'vue'
import { deleteSpaceUsingPost, getSpaceVoByIdUsingGet } from '@/api/spaceController'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { listPictureVoByPageUsingPost } from '@/api/pictureController'
import { formatSize } from '@/utils'
import PictureList from '@/components/PictureList.vue'
import PictureSearchForm from '@/components/PictureSearchForm.vue'

interface Props {
  id: number | string
}

const props = defineProps<Props>()
const space = ref<API.SpaceVo>({})

//获取空间信息
const fetchSpaceDetail = async () => {
  try {
    const res = await getSpaceVoByIdUsingGet({ id: props.id })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    } else {
      message.error('获取空间信息失败 ' + res.data.msg)
    }
  } catch (e) {
    message.error('获取空间信息失败 ' + e.message)
  }
}

//页面加载时获取数据 请求一次
onMounted(() => {
  fetchSpaceDetail()
})

const dataList = ref<API.PictureVo[]>([])
const total = ref(0)
const loading = ref(true)

//搜索条件
const searchParams = ref<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

//分页参数
const onPageChange = (page: number, pageSize: number) => {
  searchParams.value.current = page
  searchParams.value.pageSize = pageSize
  fetchData()
}

const fetchData = async () => {
  loading.value = true
  const params = {
    spaceId: props.id,
    ...searchParams.value,
  }

  const res = await listPictureVoByPageUsingPost(params)
  if (res.data.code == 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败 ' + res.data.msg)
  }
  loading.value = false
}

//页面加载时获取数据 请求一次
onMounted(() => {
  fetchData()
})

//搜索
const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  searchParams.value = {
    ...searchParams.value,
    ...newSearchParams,
    current: 1,
  }
  fetchData()
}
</script>
<style scoped>
#spaceDetailPage {
}
</style>
