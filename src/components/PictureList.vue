<template>
  <div id="picture-list">
    <!--    图片列表-->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"

      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <!--            单张图片-->
          <a-card hoverable @click="doClickPicture(picture)">
            <template #cover>
              <img
                :alt="picture.name"
                :src="picture.thumbnailUrl ?? picture.url"
                style="height: 180px; object-fit: cover"
              />
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex>
                  <a-tag color="green">
                    {{ picture.category ?? '默认' }}
                  </a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag">
                    {{ tag }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
            <template #actions v-if="showOp">
              <a-space @click="e => doSearch(picture, e)">
                <SearchOutlined />
                搜索
              </a-space>
              <a-space @click="e => doEdit(picture, e)">
                <EditOutlined/>
                编辑
              </a-space>
              <a-space @click="e => doDelete(picture, e)">
                <DeleteOutlined />
                删除
              </a-space>
            </template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

import { useRouter } from 'vue-router'
import {DeleteOutlined, EditOutlined,SearchOutlined} from '@ant-design/icons-vue'
import { deletePictureUsingPost } from '@/api/pictureController'
import { message } from 'ant-design-vue'

interface Props{
  dataList? : API.PictureVo[]
  loading? : boolean
  showOp?: boolean //主页不显示操作按钮
  onReload?: () => void
}


const props = withDefaults(defineProps<Props>(), {
  //数组或对象需要用 () => xx来赋值
  dataList: () => [],
  loading: false,
  showOp: false

})

const router = useRouter()

//跳转到图片详情页
const doClickPicture = (picture: API.PictureVo) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

const doSearch = (picture,e) =>{
  //阻止冒泡
  e.stopPropagation()
  //打开新的页面
  window.open(`/search_picture?pictureId=${picture.id}`)
}

const doEdit = (picture,e) =>{
  //阻止冒泡
  e.stopPropagation()
  //跳转到编辑页面时需要携带spaceId
  router.push({
    path: `/add_picture`,
    query: {
      id: picture.id,
      spaceId: picture.spaceId
    }
  })
}

const doDelete = async (picture,e) => {
  //阻止冒泡
  e.stopPropagation()
  const id = picture.id
  if (!id) {
    return
  }
  const res = await deletePictureUsingPost({ id })
  if (res.data.code === 0) {
    message.success('删除成功')
    props.onReload?.()
  } else {
    message.error('删除失败')
  }
}

</script>
<style scoped></style>
