import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: '主页',
      component: () => import("../pages/HomePage.vue"),
    },
    {
      path: '/user/login',
      name: '用户登录',
      component: () => import("../pages/user/UserLoginPage.vue"),
    },
    {
      path: '/user/register',
      name: '用户注册',
      component: () => import("../pages/user/UserRegisterPage.vue"),
    },
    {
      path: '/admin/userManage',
      name: '用户管理',
      component: () => import("../pages/admin/UserManagePage.vue"),
    },
    {
      path: '/admin/pictureManage',
      name: '图片管理',
      component: () => import("../pages/admin/PictureManagePage.vue"),
    },
    {
      path: '/add_picture',
      name: '创建图片',
      component: () => import("../pages/AddPicturePage.vue"),
    },
    {
      path: '/picture/:id',
      name: '图片详情',
      component: () => import("../pages/PictureDetailPage.vue"),
      props: true //该属性为true能通过属性获得动态id
    },
    {
      path: '/about',
      name: '关于',
      component: () => import("../views/AboutView.vue")
    }
  ],

})

export default router
