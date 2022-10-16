<template>
  <div ref="charts" class="charts" />
</template>

<script>
import * as echarts from 'echarts'
export default {
  name: 'BarChart',
  mounted() {
    // 初始化echarts实例
    const barCharts = echarts.init(this.$refs.charts)
    // 配置数据
    barCharts.setOption({
      xAxis: {
        // 隐藏x轴
        show: false,
        // 均分
        type: 'category'
      },
      yAxis: {
        // 隐藏y轴
        show: false
      },
      series: {
        type: 'bar',
        data: [10, 7, 21, 15, 33, 12, 50, 43, 88, 66, 19]
      },
      // 布局
      grid: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      },
      // 提示信息
      tooltip: {}
    })
  }
}
</script>

<style>
.charts {
  width: 100%;
  height: 100%;
}
</style>
