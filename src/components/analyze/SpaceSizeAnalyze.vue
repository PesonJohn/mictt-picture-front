<template>
  <div class="space-size-analyze">
    <a-card title="空间图片大小分析">
      <v-chart :option="options" style="height: 320px;max-width: 100%" :loading="loading"></v-chart>
    </a-card>
  </div>
</template>

<script setup lang='ts'>
import { ref, watchEffect, computed } from 'vue'
import VChart from "vue-echarts";
import "echarts";
import { getSpaceSizeAnalyzeUsingPost } from '@/api/spaceAnalyzeController'
import { message } from 'ant-design-vue'


interface Props {
  queryAll?: boolean
  queryPublic?: boolean
  spaceId?: number
}

const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false
})

const loading = ref(false)

//图表数据
const dataList = ref<API.SpaceSizeAnalyzeResponse[]>([])

const fetchData = async () => {
  loading.value = true

  const res = await getSpaceSizeAnalyzeUsingPost({
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId
  })
  if (res.data.code == 0 && res.data.data) {
    dataList.value = res.data.data ?? []
  } else {
    message.error('获取数据失败 ' + res.data.msg)
  }
  loading.value = false
}

/**
 * 监听变量，参数改变时触发数据重新加载
 */
watchEffect(() => {
  fetchData()
})
//图标选项
const options = computed(() => {
  const pieData = dataList.value.map((item) => ({
    name: item.sizeRange,
    value: item.count,
  }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      top: 'bottom',
    },
    series: [
      {
        name: '图片大小',
        type: 'pie',
        radius: '50%',
        data: pieData,
      },
    ],
  }
})



</script>
<style scoped>

</style>
