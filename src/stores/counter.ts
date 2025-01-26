import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

// 一个状态存储一类要共享的数据
export const useCounterStore = defineStore('counter', () => {
  // state 状态初始值
  const count = ref(0)
  // getters 变量的计算逻辑
  const doubleCount = computed(() => count.value * 2)

  // actions 改变状态的方法
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
