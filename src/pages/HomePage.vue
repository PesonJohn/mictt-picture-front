<template>
  <div id="homePage">
    <!--搜索框-->
    <div class="search-bar">
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="搜索图片"
        enter-button="搜索"
        size="large"
        @search="doSearch"
      />
    </div>
    <!--    分类和标签筛选-->
    <a-tabs v-model:active-key="selectedCategory" @change="doSearch">
      <a-tab-pane key="all" tab="全部" />
      <a-tab-pane v-for="category in categoryList" :tab="category" :key="category" />
    </a-tabs>
    <div class="tag-bar">
      <span style="margin-right: 8px">标签:</span>
      <a-space :size="[0, 8]" wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag"
          v-model:checked="selectedTagList[index]"
          @change="doSearch"
        >
          {{ tag }}
        </a-checkable-tag>
      </a-space>
    </div>
    <!--    图片列表-->
    <PictureList :dataList="dataList" :loading="loading" />
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
import { ref, reactive, computed, onMounted } from 'vue'
import {
  listPictureByPageUsingPost,
  listPictureTagCategoryUsingGet,
  listPictureVoByPageUsingPost,
} from '@/api/pictureController'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import PictureList from '@/components/PictureList.vue'

const dataList = ref<API.PictureVo[]>([])
const total = ref(0)
const loading = ref(true)
const router = useRouter()

//搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

//分页参数
const onPageChange = (page: number, pageSize: number) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}

const fetchData = async () => {
  loading.value = true
  const params = {
    ...searchParams,
    tags: [] as string[],
  }
  if (selectedCategory.value !== 'all') {
    params.category = selectedCategory.value
  }
  /**
   * selectedTagList数组是boolean数组 为true的代表选择的标签
   * index对应tagList的索引
   */
  selectedTagList.value.forEach((useTag, index) => {
    if (useTag) {
      params.tags.push(tagList?.value[index])
    }
  })
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
  getTagCategory()
})

const doSearch = () => {
  //重置搜索条件页码
  searchParams.current = 1
  fetchData()
}

const categoryList = ref<string[]>()
const selectedCategory = ref<string>('all')
const tagList = ref<string[]>()
const selectedTagList = ref<boolean[]>([])

/**
 * 获取标签和分类
 */
const getTagCategory = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    tagList.value = res.data.data.tagList ?? []
    categoryList.value = res.data.data.categoryList ?? []
  } else {
    message.error('获取分类标签失败' + res.data.msg)
  }
}
</script>
<style scoped>
#homePage {
  margin-bottom: 16px;
}

#homePage .search-bar {
  max-width: 480px;
  margin: 0 auto 16px;
}

#homePage .tag-bar {
  margin-bottom: 16px;
}
</style>
