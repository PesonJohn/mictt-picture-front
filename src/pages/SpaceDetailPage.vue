<template>
  <div id="spaceDetailPage">
    <!--  空间信息-->
    <a-flex justify="space-between">
      <h2>{{ space.spaceName }} (私有空间)</h2>
      <a-space size="middle">
        <a-button type="primary" :href="`/add_picture?spaceId=${id}`" target="_blank"
          >+ 创建图片
        </a-button>
        <a-button
          type="primary"
          ghost
          :icon="h(BarChartOutlined)"
          :href="`/space_analyze?spaceId=${id}`"
          target="_blank"
          >空间分析
        </a-button>
        <a-button :icon="h(EditOutlined)" @click="doBatchEdit">批量编辑 </a-button>
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
    <div style="margin-bottom: 16px" />
    <!--    搜索表单-->
    <PictureSearchForm :onSearch="onSearch" />
    <!-- 按颜色搜索  跟其他搜索条件独立-->
    <div style="margin-bottom: 16px" />
    <a-form-item label="按颜色搜索" style="margin-top: 16px">
      <color-picker format="hex" shape="circle" @pureColorChange="onColorChange" />
    </a-form-item>
    <!--    图片列表-->
    <PictureList :dataList="dataList" :loading="loading" :show-op="true" :onReload="fetchData" />
    <!--    分页-->
    <a-pagination
      style="text-align: right"
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      @change="onPageChange"
    />
    <BatchEditPictureModal
      ref="batchEditPictureModalRef"
      :spaceId="id"
      :pictureList="dataList"
      :onSuccess="onBatchEditPictureSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, h } from 'vue'
import { deleteSpaceUsingPost, getSpaceVoByIdUsingGet } from '@/api/spaceController'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import {
  listPictureVoByPageUsingPost,
  searchPictureByColorUsingPost,
} from '@/api/pictureController'
import { formatSize } from '@/utils'
import PictureList from '@/components/PictureList.vue'
import PictureSearchForm from '@/components/PictureSearchForm.vue'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'
import BatchEditPictureModal from '@/components/BatchEditPictureModal.vue'
import { EditOutlined, BarChartOutlined } from '@ant-design/icons-vue'

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

const onColorChange = async (color: string) => {
  loading.value = true
  const res = await searchPictureByColorUsingPost({
    picColor: color,
    spaceId: props.id,
  })
  if (res.data.code == 0 && res.data.data) {
    const data = res.data.data ?? []
    dataList.value = data
    total.value = data.length
  } else {
    message.error('获取数据失败 ' + res.data.msg)
  }
  loading.value = false
}

//批量编辑图片
const batchEditPictureModalRef = ref()

const onBatchEditPictureSuccess = () => {
  fetchData()
}

//打开批量编辑图片弹窗
const doBatchEdit = () => {
  if (batchEditPictureModalRef.value) {
    batchEditPictureModalRef.value.openModal()
  }
}
</script>
<style scoped>
#spaceDetailPage {
  margin-bottom: 16px;
}
</style>
