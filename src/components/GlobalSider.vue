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
import { computed, h, ref, watchEffect } from 'vue'
import { UserOutlined, PictureOutlined,TeamOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { SPACE_TYPE_ENUM } from '@/constants/space'
import { listMyTeamSpaceUsingPost } from '@/api/spaceUserController'
import { message } from 'ant-design-vue'

const loginUserStore = useLoginUserStore()

//未经过滤的菜单栏
const fixedMenuItems = [
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
  {
    key: '/add_space?type='+SPACE_TYPE_ENUM.TEAM,
    icon: () => h(TeamOutlined),
    label: '创建团队',
    title: '创建团队',
  },
]

const teamSpaceList = ref<API.SpaceUserVo[]>([])
const menuItems = computed(() => {
  //如果用户没有团队空间，只展示固定菜单
  if (teamSpaceList.value.length === 0) {
    return fixedMenuItems
  } else {
    //如果用户有团队空间，则展示固定菜单和团队空间菜单
    const teamSpaceSubMenus = teamSpaceList.value.map((spaceUser) => {
      const space = spaceUser.space
      return {
        key: '/space/' + spaceUser.spaceId,
        label: space?.spaceName,
      }
    })
    const teamSpaceMenuGroup = {
      type: 'group',
      key: 'teamSpace',
      label: '我的团队',
      children: teamSpaceSubMenus,
    }
    return [...fixedMenuItems, teamSpaceMenuGroup]
  }
})

//加载团队空间列表
const fetchTeamSpaceList = async () => {
  const res = await listMyTeamSpaceUsingPost()
  if (res.data.code === 0) {
    teamSpaceList.value = res.data.data
  }else{
    message.error("加载团队空间失败，"+ res.data.msg)
  }
}

watchEffect(() => {
  //登录才加载
  if (loginUserStore.loginUser.id){
    fetchTeamSpaceList()
  }
})

const router = useRouter()

// antdv的菜单click回调参数是function({ item, key, keyPath })
const doMenuCLick = ({ key }) => {
  router.push(key)
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
