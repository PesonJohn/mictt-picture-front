<template>
  <div id="addPicturePage">
    <h2 style="margin-bottom: 16px">{{ route.query?.id ? '修改图片' : '创建图片' }}</h2>
    <a-typography-paragraph v-if="spaceId" type="secondary">
      保存至空间：<a :href="`/space/${spaceId}`" target="_blank">{{ spaceId }}</a>
    </a-typography-paragraph>
    <!--      上传图片组件-->
    <a-tabs v-model:activeKey="uploadType">
      <a-tab-pane key="file" tab="文件上传">
        <PictureUpload :picture="picture" :spaceId="spaceId" :on-success="onSuccess" />
      </a-tab-pane>
      <a-tab-pane key="key" tab="URL 上传" force-render>
        <UrlPictureUpload :picture="picture" :spaceId="spaceId" :on-success="onSuccess" />
      </a-tab-pane>
    </a-tabs>
    <!--    图片编辑-->
    <div v-if="picture" class="edit-bar">
      <a-space size="middle">
        <a-button :icon="h(EditOutlined)" @click="doEditPicture">编辑图片</a-button>
        <a-button type="primary" :icon="h(FullscreenOutlined)" @click="doImagePainting">Ai 扩图</a-button>
      </a-space>
      <ImageCropper
        ref="imageCropperRef"
        :imageUrl="picture?.url"
        :picture="picture"
        :spaceId="spaceId"
        :onSuccess="onCropSuccess"
      />
      <ImageOutPainting ref="imageOutPaintingRef" :picture="picture" :spaceId="spaceId" :onSuccess="onImageOutPaintingSuccess"/>
    </div>
    <!--    图片信息表单-->
    <a-form
      v-if="picture"
      name="pictureForm"
      layout="vertical"
      :model="pictureForm"
      @finish="handleSubmit"
    >
      <a-form-item name="name" label="名称">
        <a-input v-model:value="pictureForm.name" placeholder="请输入名称" allow-clear />
      </a-form-item>
      <a-form-item name="introduction" label="简介">
        <a-textarea
          v-model:value="pictureForm.introduction"
          placeholder="输入简介"
          :auto-size="{ minRows: 2, maxRows: 5 }"
          allow-clear
        />
      </a-form-item>
      <a-form-item name="category" label="分类">
        <a-auto-complete
          v-model:value="pictureForm.category"
          placeholder="请输入分类"
          :options="categoryOptions"
          allow-clear
        />
      </a-form-item>
      <a-form-item name="tags" label="标签">
        <a-select
          v-model:value="pictureForm.tags"
          mode="tags"
          placeholder="请输入标签"
          :options="tagOptions"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%"
          >{{ route.query?.id ? '修改' : '创建' }}
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, h } from 'vue'
import PictureUpload from '@/components/PictureUpload.vue'
import { message } from 'ant-design-vue'
import {
  editPictureUsingPost,
  getPictureByIdUsingGet,
  getPictureVoByIdUsingGet,
  listPictureTagCategoryUsingGet,
} from '@/api/pictureController'
import { useRoute, useRouter } from 'vue-router'
import { id } from 'postcss-selector-parser'
import UrlPictureUpload from '@/components/UrlPictureUpload.vue'
import ImageCropper from '@/components/ImageCropper.vue'
import { EditOutlined,FullscreenOutlined } from '@ant-design/icons-vue'
import ImageOutPainting from '@/components/ImageOutPainting.vue'

const picture = ref<API.PictureVo>()
// 因为上传图片后图片的信息已经在数据中，有对应的图片id，实际上就是编辑图片信息
const pictureForm = reactive<API.PictureEditRequest>({})

const uploadType = ref<'file' | 'url'>('file')

const onSuccess = (newPicture: API.PictureVo) => {
  picture.value = newPicture
  pictureForm.name = newPicture.name
}

const router = useRouter()
const route = useRoute()

//空间id
const spaceId = computed(() => {
  return route.query?.spaceId
})

/**
 * 表单提交
 * @param values
 */
const handleSubmit = async (values: any) => {
  const pictureId = picture.value?.id
  if (!pictureId) {
    return
  }

  const res = await editPictureUsingPost({
    id: pictureId,
    spaceId: spaceId.value,
    ...values,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('创建成功')
    //跳转到图片详情页
    router.push({
      path: `/picture/${pictureId}`,
    })
  } else {
    message.error('创建失败' + res.data.msg)
  }
}

const categoryOptions = ref<string[]>()
const tagOptions = ref<string[]>()

/**
 * 获取标签和分类
 */
const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    //因为为a-select提供默认选项时，options的值有格式要求，需要按照对应格式返回
    tagOptions.value = (res.data.data.tagList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    categoryOptions.value = (res.data.data.categoryList ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error('获取标签分类失败' + res.data.msg)
  }
}

onMounted(() => {
  getOldPicture()
  getTagCategoryOptions()
})

//获取老数据
const getOldPicture = async () => {
  //获取到id 即/add_picture?id=xx
  const id = route.query.id
  if (id) {
    const res = await getPictureVoByIdUsingGet({ id })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data
      pictureForm.name = data.name
      pictureForm.introduction = data.introduction
      pictureForm.category = data.category
      pictureForm.tags = data.tags
    }
  }
}

// 图片编辑弹窗引用
const imageCropperRef = ref()

// 编辑图片
const doEditPicture = () => {
  if (imageCropperRef.value) {
    imageCropperRef.value.openModal()
  }
}

// 编辑成功事件
const onCropSuccess = (newPicture: API.PictureVo) => {
  picture.value = newPicture
}

// Ai扩图弹窗引用
const imageOutPaintingRef = ref()

// 打开Ai扩图
const doImagePainting = () => {
  if (imageOutPaintingRef.value) {
    imageOutPaintingRef.value.openModal()
  }
}

// AI扩图保存事件
const onImageOutPaintingSuccess = (newPicture: API.PictureVo) => {
  picture.value = newPicture
}
</script>
<style scoped>
#addPicturePage {
  margin: 0 auto;
  max-width: 720px;
}

#addPicturePage .edit-bar {
  text-align: center;
  margin: 16px 0;
}

</style>
