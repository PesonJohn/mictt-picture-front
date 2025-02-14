<template>
  <div id="addSpacePage">
    <h2 style="margin-bottom: 16px">{{ route.query?.id ? '修改' : '创建' }} {{SPACE_TYPE_MAP[spaceType]}}</h2>
    <!--    空间信息表单-->
    <a-form
      name="spaceForm"
      layout="vertical"
      :model="spaceForm"
      @finish="handleSubmit"
    >
      <a-form-item name="spaceName" label="空间名称">
        <a-input v-model:value="spaceForm.spaceName" placeholder="请输入空间名称" allow-clear />
      </a-form-item>
      <a-form-item label="空间级别" name="spaceLevel">
        <a-select
          v-model:value="spaceForm.spaceLevel"
          :options="SPACE_LEVEL_OPTIONS"
          placeholder="请选择空间级别"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="loading" style="width: 100%">
          提交
        </a-button>
      </a-form-item>
    </a-form>
<!--    空间级别介绍-->
    <a-card title="空间级别介绍">
      <a-typography-paragraph>
        * 目前仅支持开通普通版，如需升级请联系
        <a href="https://iconson.top" target="_blank">shark</a>
      </a-typography-paragraph>
      <a-typography-paragraph v-for="spaceLevel in spaceLevelList">
        {{ spaceLevel.text}}: 大小 {{ formatSize(spaceLevel.maxSize)}}, 上数量 {{ spaceLevel.maxCount}}
      </a-typography-paragraph>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'

import { message } from 'ant-design-vue'
import {
  addSpaceUsingPost,
  editSpaceUsingPost,
  getSpaceVoByIdUsingGet,
  listSpaceLevelUsingGet, updateSpaceUsingPost
} from '@/api/spaceController'
import { useRoute, useRouter } from 'vue-router'
import { SPACE_LEVEL_OPTIONS, SPACE_TYPE_ENUM, SPACE_TYPE_MAP } from '@/constants/space'
import { formatSize } from '@/utils'

const space = ref<API.SpaceVo>()
const spaceForm = reactive<API.SpaceAddRequest | API.SpaceEditRequest>({})
const loading = ref(false)
const spaceLevelList = ref<API.SpaceLevel[]>([])

//空间类别 默认为私有空间
const spaceType = computed(() => {
  if (route.query?.type){
    return Number(route.query?.type)
  }else {
    return SPACE_TYPE_ENUM.PRIVATE
  }
})

const router = useRouter()
const route = useRoute()

/**
 * 表单提交
 * @param values
 */
const handleSubmit = async (values: any) => {
  const spaceId = space.value?.id
  loading.value = true
  let res
  //更新
  if (spaceId){
    res = await updateSpaceUsingPost({
      id: spaceId,
      ...values,
    })
  }else {
    //创建
    res = await addSpaceUsingPost({
      ...values,
      spaceType: spaceType.value,
    })
  }

  if (res.data.code === 0 && res.data.data) {
    message.success('操作成功')
    //跳转到空间详情页
    router.push({
      path: `/space/${res.data.data}`,
    })
  } else {
    message.error('操作失败' + res.data.msg)
  }
  loading.value = false
}

//获取空间级别列表
const fetchSpaceLevelList = async () => {
  const res = await listSpaceLevelUsingGet()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
  }else {
    message.error('获取空间级别失败' + res.data.msg)
  }
}

//获取老数据
const getOldSpace = async () => {
  //获取到id 即/add_space?id=xx
  const id = route.query.id
  if (id) {
    const res = await getSpaceVoByIdUsingGet({ id })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      space.value = data
      spaceForm.spaceName = data.spaceName
      spaceForm.spaceLevel = data.spaceLevel
    }
  }
}

onMounted(() => {
  getOldSpace()
  fetchSpaceLevelList()
})
</script>
<style scoped>
#addSpacePage {
  margin: 0 auto;
  max-width: 720px;
}
</style>
