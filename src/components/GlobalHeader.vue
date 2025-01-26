<template>
  <div id="globalHeader">
    <a-row :wrap="false">
      <a-col flex="200px">
        <router-link to="/">
          <div class="title-bar">
            <img src="../assets/logo.svg" alt="logo" class="logo" />
            <div class="title">MICT图库</div>
          </div>
        </router-link>
      </a-col>
      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuCLick"
        />
      </a-col>
      <!--      用户信息展示拦-->
      <a-col flex="120px">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <a-space>
                <a-avatar :src="loginUserStore.loginUser.userAvatar">
                  <template #icon>
                    <span v-if="!loginUserStore.loginUser.userAvatar">
                      {{
                        loginUserStore.loginUser.userName?.charAt(
                          loginUserStore.loginUser.userName.length - 1,
                        )
                      }}
                    </span>
                  </template>
                </a-avatar>
                {{ loginUserStore.loginUser.userName ?? '匿名' }}
              </a-space>

              <template #overlay>
                <a-menu>
                  <a-menu-item @click="doLogout">
                    <LogoutOutlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts" setup>
import { computed, h, ref } from 'vue'
import { HomeOutlined, LogoutOutlined } from '@ant-design/icons-vue'
import { MenuProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { userLogoutUsingPost } from '@/api/userController'

const loginUserStore = useLoginUserStore()

//未经过滤的菜单栏
const originItems = [
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/add_picture',
    label: '上传图片',
    title: '上传图片',
  },
  {
    key: '/admin/userManage',
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/admin/pictureManage',
    label: '图片管理',
    title: '图片管理',
  },
  {
    key: 'others',
    label: h('a', { href: 'https://iconson.top', target: '_blank' }, '我'),
    title: '编程导航',
  },
]

//过滤菜单项
const filterMenus = (menus = [] as MenuProps['items']) => {
  return menus?.filter((menu) => {
    //管理员才能看到/admin开头的菜单
    if (menu?.key?.startsWith('/admin')) {
      const loginUser = loginUserStore.loginUser
      if (!loginUser.userRole || loginUser.userRole !== 'admin') {
        return false
      }
    }
    return true
  })
}

//展示在菜单的路由数组
const items = computed(() => filterMenus(originItems))

const router = useRouter()

// antdv的菜单click回调参数是function({ item, key, keyPath })
const doMenuCLick = ({ key }) => {
  router.push({
    path: key,
  })
}

const doLogout = async () => {
  const res = await userLogoutUsingPost()
  if (res.data.code === 0) {
    loginUserStore.setLoginUser({
      userName: '未登录',
    })
    message.success('退出登录成功')
    router.push('/user/login')
  } else {
    message.error('退出登录失败 ' + res.data.msg)
  }
}

// 当前高亮
const current = ref<string[]>(['home'])
// 监听路由变化，更新高亮菜单项
router.afterEach((to) => {
  current.value = [to.path]
})
</script>

<style scoped>
#globalHeader .title-bar {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
}

.title {
  color: black;
  font-size: 18px;
  margin-left: 16px;
}
</style>
