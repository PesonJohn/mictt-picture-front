<template>
  <div class="space-user-analyze">
    <a-card title="空间图片用户分析">
      <v-chart :option="options" style="height: 320px;max-width: 100%" :loading="loading"></v-chart>
      <template #extra>
        <a-space>
          <a-segmented v-model:value="timeDimension" :options="timeDimensionOptions" />
          <a-input-search  plcaeholder="请输入用户id" enter-button="搜索用户" @search="doSearch" />
        </a-space>
      </template>
    </a-card>
  </div>
</template>

<script setup lang='ts'>
import { ref, watchEffect, computed } from 'vue'
import VChart from "vue-echarts";
import "echarts";
import { getSpaceUserAnalyzeUsingPost } from '@/api/spaceAnalyzeController'
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

//用户id选项
const userId = ref<string>()

const doSearch = (value: string) => {
  userId.value = value
}

//时间维度
const timeDimension = ref<string>('day')
//时间维度选项
const timeDimensionOptions = [
  {
    label: '日',
    value: 'day',
  },
  {
    label: '周',
    value: 'week',
  },
  {
    label: '月',
    value: 'month',
  },
]


const loading = ref(false)

//图表数据
const dataList = ref<API.SpaceUserAnalyzeResponse[]>([])

const fetchData = async () => {
  loading.value = true

  const res = await getSpaceUserAnalyzeUsingPost({
    queryAll: props.queryAll,
    queryPublic: props.queryPublic,
    spaceId: props.spaceId,
    timeDimension: timeDimension.value,
    userId: userId.value
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
  const periods = dataList.value.map((item) => item.period) // 时间区间
  const counts = dataList.value.map((item) => item.count) // 上传数量

  return {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: periods, name: '时间区间' },
    yAxis: { type: 'value', name: '上传数量' },
    series: [
      {
        name: '上传数量',
        type: 'line',
        data: counts,
        smooth: true, // 平滑折线
        emphasis: {
          focus: 'series',
        },
      },
    ],
  }
})



</script>
<style scoped>

</style>
