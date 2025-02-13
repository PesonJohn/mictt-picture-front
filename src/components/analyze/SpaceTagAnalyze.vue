<template>
  <div class="space-tag-analyze">
    <a-card title="空间图片标签分析">
      <v-chart :option="options" style="height: 320px;max-width: 100%" :loading="loading"></v-chart>
    </a-card>
  </div>
</template>

<script setup lang='ts'>
import { ref, watchEffect, computed } from 'vue'
import VChart from "vue-echarts";
import "echarts";
import "echarts-wordcloud"
import { getSpaceCategoryAnalyzeUsingPost, getSpaceTagAnalyzeUsingPost } from '@/api/spaceAnalyzeController'
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
const dataList = ref<API.SpaceTagAnalyzeResponse[]>([])

const fetchData = async () => {
  loading.value = true

  const res = await getSpaceTagAnalyzeUsingPost({
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
  const tagData = dataList.value.map((item) => ({
    name: item.tag,
    value: item.count,
  }))

  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => `${params.name}: ${params.value} 次`,
    },
    series: [
      {
        type: 'wordCloud',
        gridSize: 10,
        sizeRange: [12, 50], // 字体大小范围
        rotationRange: [-90, 90],
        shape: 'circle',
        textStyle: {
          color: () =>
            `rgb(${Math.round(Math.random() * 255)}, ${Math.round(
              Math.random() * 255,
            )}, ${Math.round(Math.random() * 255)})`, // 随机颜色
        },
        data: tagData,
      },
    ],
  }
})



</script>
<style scoped>

</style>
