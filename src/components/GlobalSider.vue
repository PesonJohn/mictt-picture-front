<template>
  <div id="globalSider">
    <a-layout-sider
      v-if="loginUserStore.loginUser.id"
      width="200"
      breakpoint="lg"
      collapsed-width="0"
    >
      <a-menu v-model:selectedKeys="current" mode="inline" :items="menuItems" @click="doMenuCLick">
      </a-menu>
    </a-layout-sider>
  </div>
</template>
<script lang="ts" setup>
import { computed, h, ref } from 'vue'
import { UserOutlined, PictureOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'

const loginUserStore = useLoginUserStore()

//未经过滤的菜单栏
const menuItems = [
  {
    key: '/',
    icon: () => h(PictureOutlined),
    label: '公共图库',
    title: '公共图库',
  },
  {
    key: '/my_space',
    icon: () => h(UserOutlined),
    label: '我的空间',
    title: '我的空间',
  },
]

const router = useRouter()

// antdv的菜单click回调参数是function({ item, key, keyPath })
const doMenuCLick = ({ key }) => {
  router.push({
    path: key,
  })
}

// 当前高亮
const current = ref<string[]>(['home'])
// 监听路由变化，更新高亮菜单项
router.afterEach((to) => {
  current.value = [to.path]
})
</script>

<style scoped>
#globalSider .ant-layout-sider {
  background: none;
}
</style>
