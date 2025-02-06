<template>
  <a-config-provider :locale="appLocale">
    <div id="app">
      <BasicLayout />
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import BasicLayout from '@/layouts/BasicLayout.vue'
import zhCN from 'ant-design-vue/es/locale/zh_CN' //antd中文包
import 'dayjs/locale/zh-cn.js'
import dayjs from 'dayjs'
//dayjs中文包

dayjs.locale('zh-cn')
const appLocale = zhCN

// import { healthUsingGet } from '@/api/mainController'
// import { useLoginUserStore } from '@/stores/useLoginUserStore'
//
// healthUsingGet().then(res=>{
//   console.log(res)
// })
//
//已经改为在校验文件中获取
// const loginUserStore = useLoginUserStore()
// loginUserStore.fetchLoginUser()
</script>
<style scoped></style>
