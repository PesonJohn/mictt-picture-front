<template>
  <div id="mySpacePage">
    <p>跳转中</p>
  </div>
</template>

<script setup lang="ts">

import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { listSpaceVoByPageUsingPost } from '@/api/spaceController'
import { message } from 'ant-design-vue'
import { onMounted } from 'vue'

const router = useRouter()
const loginUserStore = useLoginUserStore()

//检查用户是否有个人空间
const checkUserSpace = async () => {
  const loginUser = loginUserStore.loginUser
  //用户未登录则跳转到登录界面
  if (!loginUser?.id){
    router.replace("/user/login")
    return
  }
  //用户登录则获取用户已创建的空间
  const res = await listSpaceVoByPageUsingPost({
    userId: loginUser.id,
    current: 1,
    pageSize: 1,
  })
  if (res.data.code === 0){
    //如果有空间则跳转到第一个空间，如果没有则跳转到添加空间界面
    if (res.data.data?.records?.length > 0){
      const space = res.data.data?.records[0]
      router.replace(`/space/${space?.id}` )
    }else {
      router.replace(`/add_space` )
      message.warn("请先创建空间")
    }
  }else {
    message.error("获取空间失败 " + res.data.msg)
  }
}
//页面加载时检查用户是否有个人空间
onMounted(() => {
  checkUserSpace()
})

</script>
<style scoped>

</style>
